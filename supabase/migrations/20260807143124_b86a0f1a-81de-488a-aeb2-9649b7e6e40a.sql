CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE TABLE public.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  blurb text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Categories are publicly viewable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id text NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  price integer NOT NULL DEFAULT 0,
  note text NOT NULL DEFAULT '',
  in_stock boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are publicly viewable" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.categories (id, name, blurb, sort_order) VALUES
 ('cables','Cables','HDMI, USB-C, AUX, LAN, power leads',1),
 ('connectors','Connectors','Jacks, adaptors, converters, lugs',2),
 ('remotes','Remotes','TV, set-top box, AC and universal',3),
 ('components','Components','Resistors, ICs, boards, soldering',4),
 ('laptop','Laptop Accessories','Chargers, hubs, stands, keyboards',5),
 ('mobile','Mobile Accessories','Chargers, covers, earphones, holders',6);

INSERT INTO public.products (name, category_id, price, note, sort_order) VALUES
 ('HDMI 2.0 Cable — 1.5m','cables',299,'4K @ 60Hz, gold plated',1),
 ('USB-C Fast Charging Cable','cables',199,'65W, braided, 1m',2),
 ('CAT6 LAN Cable — 3m','cables',249,'Gigabit, moulded ends',3),
 ('3.5mm AUX Cable','cables',99,'Copper core, 1m',4),
 ('RCA to 3.5mm Connector','connectors',89,'Stereo audio adaptor',5),
 ('HDMI Female Coupler','connectors',129,'Straight joiner',6),
 ('USB OTG Adaptor','connectors',79,'Type-C to USB-A',7),
 ('Universal TV Remote','remotes',249,'Works with most brands',8),
 ('Set-Top Box Remote','remotes',199,'Tata Play / Airtel / DishTV',9),
 ('Split AC Remote','remotes',279,'Universal, backlit keys',10),
 ('Resistor Assortment Kit','components',149,'600 pcs, 1/4W',11),
 ('Soldering Iron 25W','components',349,'With stand and wire',12),
 ('Arduino-Compatible Uno Board','components',649,'With USB cable',13),
 ('Laptop Adaptor 65W','laptop',999,'HP / Dell / Lenovo pins',14),
 ('4-in-1 Type-C Hub','laptop',799,'HDMI, USB 3.0, SD',15),
 ('Aluminium Laptop Stand','laptop',899,'Foldable, adjustable',16),
 ('20W Mobile Charger','mobile',549,'PD fast charge',17),
 ('Wired Earphones','mobile',249,'With mic, deep bass',18),
 ('10000mAh Power Bank','mobile',1099,'Dual output, fast charge',19),
 ('Bike Mobile Holder','mobile',349,'Shockproof clamp',20);