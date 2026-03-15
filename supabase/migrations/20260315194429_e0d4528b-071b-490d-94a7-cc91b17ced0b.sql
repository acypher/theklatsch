-- Grant admin role to your current account so admin-only UI (Advance Issue button) appears
INSERT INTO public.user_roles (user_id, role)
VALUES ('2bb88f42-cf99-452d-9062-1900683c8ecb'::uuid, 'admin'::public.app_role)
ON CONFLICT (user_id, role) DO NOTHING;