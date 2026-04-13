"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layers3, Search } from "lucide-react";
import AuthRequiredPage from "@/components/auth/AuthRequiredPage";
import { useAuth } from "@/components/auth/AuthProvider";
import { EmptyState, IncompleteDataWarning, LoadingSkeleton, Toast } from "@/components/shared/Score";
import CompareFamilySection from "./CompareFamilySection";
import {
  addOfferToCompareGroups,
  clearCompareGroup,
  hydrateCompareState,
  loadCompareOfferSnapshots,
  mergeOffersIntoCompareGroups,
  removeOfferFromCompareGroup,
} from "./store";
import { getOfferCompareFamily } from "./families";
import type { CompareGroup } from "./types";
import { getProjectDecisionContext } from "@/features/projects/api";
import type { ProjectDecisionContext } from "@/lib/core";
import { useTimedMessage } from "@/lib/hooks/useTimedMessage";
import { getOffers, incrementCompareCount } from "@/lib/services/offers";
import type { Offer } from "@/lib/data";
import { getOfferDisplayScore, rankOffersByScore } from "@/lib/score/engine";

export default function ComparePageClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { message, showMessage } = useTimedMessage();
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [compareGroups, setCompareGroups] = useState<CompareGroup[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [projectContext, setProjectContext] = useState<ProjectDecisionContext | null>(null);
  const didCountComparisonRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const data = await getOffers({});
      const hydratedState = await hydrateCompareState();
      const snapshotOffers = loadCompareOfferSnapshots();
      let nextAllOffers = [...data];

      snapshotOffers.forEach((snapshotOffer) => {
        if (!nextAllOffers.some((item) => String(item.id) === String(snapshotOffer.id))) {
          nextAllOffers.push(snapshotOffer);
        }
      });

      if (cancelled) return;

      let nextGroups = hydratedState.groups;
      const ids = searchParams.get("ids");
      if (ids) {
        const incomingIds = ids.split(",").filter(Boolean).map((id) => String(id));
        const incomingOffers = incomingIds
          .map((id) => nextAllOffers.find((offer) => String(offer.id) === id))
          .filter(Boolean) as Offer[];
        nextGroups = await mergeOffersIntoCompareGroups(incomingOffers);
      }

      const bestBuyIds = Array.from(new Set(nextGroups.flatMap((group) => group.offerIds))).filter((id) =>
        id.startsWith("bestbuy-"),
      );
      if (bestBuyIds.length > 0) {
        const response = await fetch("/api/bestbuy/offers?ids=" + encodeURIComponent(bestBuyIds.join(",")));
        if (response.ok) {
          const json = await response.json();
          const liveOffers = (json.offers || []) as Offer[];
          nextAllOffers = [
            ...nextAllOffers,
            ...liveOffers.filter((liveOffer) => !nextAllOffers.some((item) => item.id === liveOffer.id)),
          ];
        }
      }

      if (cancelled) return;
      setAllOffers(nextAllOffers);
      setCompareGroups(nextGroups);

      const projectId = searchParams.get("project");
      if (projectId) {
        const nextProjectContext = await getProjectDecisionContext(projectId);
        if (!cancelled) setProjectContext(nextProjectContext);
      } else if (!cancelled) {
        setProjectContext(null);
      }

      if (!cancelled) setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const selectedOfferIds = useMemo(
    () => Array.from(new Set(compareGroups.flatMap((group) => group.offerIds.map((id) => String(id))))),
    [compareGroups],
  );

  const filtered = useMemo(() => {
    if (!search) return [];

    return allOffers.filter((offer) => {
      if (selectedOfferIds.includes(String(offer.id))) return false;
      const haystack = [offer.product, offer.brand, offer.merchant, getOfferCompareFamily(offer).label]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [allOffers, search, selectedOfferIds]);

  const groupsWithOffers = useMemo(
    () =>
      compareGroups
        .map((group) => {
          const selectedOffers = group.offerIds
            .map((id) => allOffers.find((offer) => String(offer.id) === String(id)))
            .filter(Boolean) as Offer[];

          const rankedOffers = rankOffersByScore(selectedOffers, projectContext || undefined).map((offer) => ({
            ...offer,
            contextualScore: offer.displayScore,
          }));

          return { group, offers: rankedOffers };
        })
        .filter((item) => item.offers.length > 0),
    [allOffers, compareGroups, projectContext],
  );

  const totalComparedOffers = groupsWithOffers.reduce((sum, item) => sum + item.offers.length, 0);
  const incompleteFamilies = groupsWithOffers.filter((item) => item.offers.length < 2).length;
  const readyFamilies = groupsWithOffers.filter((item) => item.offers.length >= 2).length;

  useEffect(() => {
    if (!user || didCountComparisonRef.current || readyFamilies === 0) return;
    didCountComparisonRef.current = true;
    void incrementCompareCount();
  }, [readyFamilies, user]);

  if (authLoading || !user) {
    return (
      <AuthRequiredPage
        title="Comparateur réservé aux comptes connectés"
        description="Connectez-vous pour conserver vos comparaisons, vos arbitrages et votre contexte projet."
      />
    );
  }

  async function handleAddOffer(offer: Offer) {
    const result = await addOfferToCompareGroups(offer);
    setCompareGroups(result.groups);
    setSearch("");

    if (result.status === "exists") {
      showMessage(`Cette offre est déjà dans ${result.family.label}.`);
      return;
    }

    if (result.status === "full") {
      showMessage(`${result.family.label} contient déjà 3 offres maximum.`);
      return;
    }

    showMessage(`Offre ajoutée à ${result.family.label}.`);
  }

  if (loading) {
    return <LoadingSkeleton count={3} />;
  }

  return (
    <div className="space-y-6">
      <Toast message={message} />

      <section className="premium-hero rounded-[32px] px-6 py-7 text-white md:px-8 md:py-8">
        <div className="relative z-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-100">Comparateur MAREF</p>
            <h2 className="section-title mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Arbitrez par famille, sans mélanger les sujets
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/90">
              Chaque comparaison regroupe jusqu’à 3 offres d’une même famille pour garder une lecture propre, utile et
              actionnable.
            </p>
          </div>
          <div className="hidden rounded-[26px] bg-white/10 px-5 py-4 text-right backdrop-blur-sm md:block">
            <p className="text-[0.72rem] uppercase tracking-[0.2em] text-blue-100/80">Familles actives</p>
            <p className="mt-2 text-3xl font-black">{groupsWithOffers.length}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="premium-card rounded-[24px] p-4 text-center">
          <p className="text-2xl font-black text-blue-950">{groupsWithOffers.length}</p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">Familles</p>
        </div>
        <div className="premium-card rounded-[24px] p-4 text-center">
          <p className="text-2xl font-black text-blue-950">{totalComparedOffers}</p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">Offres comparées</p>
        </div>
        <div className="premium-card rounded-[24px] p-4 text-center">
          <p className="text-2xl font-black text-blue-950">{readyFamilies}</p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">Familles prêtes</p>
        </div>
      </div>

      {projectContext && (
        <div className="premium-surface rounded-[30px] p-5">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Contexte projet</p>
          <h3 className="section-title mt-2 text-2xl font-black text-slate-950">{projectContext.projectName}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {projectContext.projectObjective || "Aucun objectif détaillé pour ce projet."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              {projectContext.projectCategory}
            </span>
            {projectContext.projectBudget && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Budget {projectContext.projectBudget}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="premium-surface rounded-[30px] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-blue-700">Ajouter une offre</p>
            <h3 className="section-title mt-2 text-2xl font-black text-slate-950">
              Envoyez une offre dans la bonne comparaison
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Le comparateur range automatiquement chaque offre dans sa famille. Une famille peut contenir jusqu’à 3
              offres.
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-blue-50 text-blue-800">
            <Layers3 className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une offre à ajouter..."
            className="flex-1 bg-transparent text-sm outline-none"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {search && (
          <div className="mt-2 max-h-64 overflow-y-auto rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
            {filtered.length === 0 ? (
              <p className="p-3 text-sm text-slate-400">Aucun résultat</p>
            ) : (
              filtered.slice(0, 8).map((offer) => {
                const family = getOfferCompareFamily(offer);
                return (
                  <button
                    key={offer.id}
                    onClick={() => void handleAddOffer(offer)}
                    className="flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left transition-colors last:border-0 hover:bg-slate-50"
                  >
                    <span className="text-lg">{family.label}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {offer.brand} {offer.product}
                      </p>
                      <p className="text-xs text-slate-400">
                        {family.label} • {offer.merchant} • {offer.price.toLocaleString("fr-FR")} €
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-blue-950">
                      {getOfferDisplayScore(offer, projectContext || undefined) ?? "--"}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {groupsWithOffers.length === 0 && !search && (
        <EmptyState
          icon={<Layers3 className="h-8 w-8 text-slate-400" />}
          title="Aucune comparaison en cours"
          description="Ajoutez des offres depuis l’explorer ou les fiches produit. Elles seront rangées automatiquement par famille."
        />
      )}

      {incompleteFamilies > 0 && (
        <IncompleteDataWarning
          title="Certaines familles sont encore incomplètes"
          description="Une comparaison devient vraiment utile à partir de 2 offres dans une même famille. Ajoutez une ou deux références pour obtenir une lecture exploitable."
        />
      )}

      <div className="space-y-5">
        {groupsWithOffers.map(({ group, offers }) => (
          <CompareFamilySection
            key={group.key}
            group={group}
            offers={offers}
            projectContext={projectContext}
            onRemoveOffer={async (groupKey, offerId) => setCompareGroups(await removeOfferFromCompareGroup(groupKey, offerId))}
            onClearGroup={async (groupKey) => {
              setCompareGroups(await clearCompareGroup(groupKey));
              showMessage("Comparaison retirée.");
            }}
            onOpenOffer={(offerId) => router.push("/explorer/" + offerId)}
          />
        ))}
      </div>
    </div>
  );
}
