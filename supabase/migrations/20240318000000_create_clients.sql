-- Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  website TEXT,
  address TEXT,
  industry TEXT,
  status TEXT DEFAULT 'active',
  email TEXT,
  last_contact TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  enriched_data JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create enrichment_logs table to track AI enrichment attempts
CREATE TABLE enrichment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  status TEXT NOT NULL,
  error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
alter table clients enable row level security;
alter table enrichment_logs enable row level security;

-- Create policies for clients table
create policy "Enable read access for authenticated users"
on clients for select
to authenticated
using (true);

create policy "Enable insert access for authenticated users"
on clients for insert
to authenticated
with check (true);

create policy "Enable update access for authenticated users"
on clients for update
to authenticated
using (true);

-- Create policies for enrichment_logs table
create policy "Enable read access for authenticated users"
on enrichment_logs for select
to authenticated
using (true);

create policy "Enable insert access for authenticated users"
on enrichment_logs for insert
to authenticated
with check (true);

create policy "Enable update access for authenticated users"
on enrichment_logs for update
to authenticated
using (true);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_industry ON clients(industry);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_enrichment_logs_client_id ON enrichment_logs(client_id);
CREATE INDEX idx_enrichment_logs_status ON enrichment_logs(status); 