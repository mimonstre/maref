-- Table historique de consultation
CREATE TABLE view_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  offer_id UUID REFERENCES offers(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE view_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique view_history" ON view_history FOR SELECT USING (true);
CREATE POLICY "Insertion publique view_history" ON view_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Suppression publique view_history" ON view_history FOR DELETE USING (true);