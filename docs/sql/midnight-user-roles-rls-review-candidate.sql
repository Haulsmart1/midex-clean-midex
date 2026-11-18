-- REVIEW ONLY. NOT A MIGRATION. DO NOT APPLY TO ANY DATABASE.
--
-- Purpose:
--   Replace Midnight's broad role-directory read policy with a self-only read
--   policy required by the verified-user fallback in PR #10.
--
-- Release prerequisites:
--   1. Generate a real migration with the repository's Supabase CLI workflow.
--   2. Compile and exercise it on an isolated database branch.
--   3. Prove a signed-in user can read only their own role rows.
--   4. Prove cross-user reads and all browser-side role mutations are denied.
--   5. Confirm role administration uses a trusted server-side service role.
--
-- This candidate intentionally removes direct browser role administration.
-- It does not create a replacement administrator endpoint.

begin;

alter table public.user_roles enable row level security;

-- Remove the existing all-authenticated read and direct-browser management
-- policies. Policy names are quoted because they include spaces/underscores.
drop policy if exists "user_roles_read_all" on public.user_roles;
drop policy if exists "allow super_admin manage roles" on public.user_roles;

-- The public browser roles need no unauthenticated access and no mutation
-- privileges. service_role/postgres grants are deliberately left untouched.
revoke all privileges on table public.user_roles from anon;
revoke insert, update, delete, truncate, references, trigger
  on table public.user_roles from authenticated;
grant select on table public.user_roles to authenticated;

create policy "user_roles_read_own"
on public.user_roles
as permissive
for select
to authenticated
using (
  (select auth.uid()) is not null
  and user_id = (select auth.uid())
);

commit;

-- Expected isolated-branch acceptance evidence (not executable here):
--   * Stuart's verified account returns exactly its stored partner row.
--   * A second authenticated account cannot read Stuart's row.
--   * anon cannot read user_roles.
--   * authenticated INSERT/UPDATE/DELETE attempts fail.
--   * trusted server-side service_role maintenance remains possible.
