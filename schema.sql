--
-- PostgreSQL database dump
--

\restrict BsZgZ4evoCoHGz4suacXbaV4ccWSkzO89BSaQkh7DObCgSQoNJKG4IVnckFTuF9

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: analytics; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA analytics;


--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: marketing; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA marketing;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: hypopg; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS hypopg WITH SCHEMA extensions;


--
-- Name: EXTENSION hypopg; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION hypopg IS 'Hypothetical indexes for PostgreSQL';


--
-- Name: index_advisor; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS index_advisor WITH SCHEMA extensions;


--
-- Name: EXTENSION index_advisor; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION index_advisor IS 'Query index advisor';


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: get_daily_page_views(date, date); Type: FUNCTION; Schema: analytics; Owner: -
--

CREATE FUNCTION analytics.get_daily_page_views(start_date date, end_date date) RETURNS TABLE(date date, page_path text, views bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    RETURN QUERY

    SELECT 

        DATE(created_at) as date,

        page_path,

        COUNT(*) as views

    FROM analytics.page_views

    WHERE DATE(created_at) BETWEEN start_date AND end_date

    GROUP BY DATE(created_at), page_path

    ORDER BY date DESC, views DESC;

END;

$$;


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: add_tag_to_client(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_tag_to_client(p_client_id uuid, p_tag_id text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$

BEGIN

    -- Add tag to client's tags array if not already present

    UPDATE trainer_clients

    SET tags = array_append(tags, p_tag_id),

        updated_at = NOW()

    WHERE client_id = p_client_id

      AND trainer_id = auth.uid()

      AND NOT (p_tag_id = ANY(tags)); -- Only add if not already present

    

    RETURN FOUND;

END;

$$;


--
-- Name: calculate_complexity_score(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_complexity_score(food_name text) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$

DECLARE

  base_score INTEGER := 70;  -- Start at "common"

  word_count INTEGER;

  comma_count INTEGER;

  paren_penalty INTEGER;

  length_penalty INTEGER;

  qualifier_penalty INTEGER;

  final_score INTEGER;

BEGIN

  -- Count words (split by spaces/commas)

  word_count := array_length(regexp_split_to_array(food_name, '[,\s]+'), 1);

  

  -- Count commas (complex descriptions)

  comma_count := LENGTH(food_name) - LENGTH(REPLACE(food_name, ',', ''));

  

  -- Parentheses indicate qualifiers

  paren_penalty := CASE WHEN food_name LIKE '%(%)%' THEN 10 ELSE 0 END;

  

  -- Length penalty (very long names = obscure)

  length_penalty := GREATEST(0, (LENGTH(food_name) - 20) / 3);

  

  -- Qualifier words that indicate specialty items

  qualifier_penalty := 0;

  qualifier_penalty := qualifier_penalty + CASE WHEN food_name ILIKE '%frozen%' THEN 3 ELSE 0 END;

  qualifier_penalty := qualifier_penalty + CASE WHEN food_name ILIKE '%canned%' THEN 3 ELSE 0 END;

  qualifier_penalty := qualifier_penalty + CASE WHEN food_name ILIKE '%dried%' THEN 3 ELSE 0 END;

  qualifier_penalty := qualifier_penalty + CASE WHEN food_name ILIKE '%powdered%' THEN 5 ELSE 0 END;

  qualifier_penalty := qualifier_penalty + CASE WHEN food_name ILIKE '%imitation%' THEN 8 ELSE 0 END;

  qualifier_penalty := qualifier_penalty + CASE WHEN food_name ILIKE '%prepared%' THEN 2 ELSE 0 END;

  qualifier_penalty := qualifier_penalty + CASE WHEN food_name ILIKE '%restaurant%' THEN 5 ELSE 0 END;

  

  -- Calculate final score

  final_score := base_score - (word_count * 3) - (comma_count * 5) - paren_penalty - length_penalty - qualifier_penalty;

  

  -- Clamp to valid range (11-70 for auto-calculated scores)

  -- Don't go below 11 (reserve 1-10 for manual rare assignments)

  -- Don't go above 70 (reserve 71-100 for manual staples)

  RETURN GREATEST(11, LEAST(70, final_score));

END;

$$;


--
-- Name: calculate_level(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_level(xp integer) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$

BEGIN

  -- Level formula: sqrt(XP / 100)

  -- Level 1: 0 XP

  -- Level 2: 100 XP

  -- Level 5: 2,500 XP

  -- Level 10: 10,000 XP

  -- Level 20: 40,000 XP

  RETURN GREATEST(1, FLOOR(SQRT(xp / 100.0))::INTEGER + 1);

END;

$$;


--
-- Name: calculate_nutrition_from_food(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_nutrition_from_food() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

DECLARE

  food_data RECORD;

BEGIN

  -- Only calculate if food_id is provided and nutrition fields are NULL

  IF NEW.food_id IS NOT NULL THEN

    -- Get food nutrition data

    SELECT calories, protein_g, carbs_g, fat_g

    INTO food_data

    FROM foods

    WHERE id = NEW.food_id;



    IF FOUND THEN

      -- Calculate nutrition based on quantity consumed

      -- Foods table stores per 100g, so multiply by quantity_consumed

      NEW.calories := ROUND((food_data.calories::numeric * NEW.quantity_consumed / 100)::numeric, 1);

      NEW.protein_g := ROUND((food_data.protein_g::numeric * NEW.quantity_consumed / 100)::numeric, 1);

      NEW.carbs_g := ROUND((food_data.carbs_g::numeric * NEW.quantity_consumed / 100)::numeric, 1);

      NEW.fat_g := ROUND((food_data.fat_g::numeric * NEW.quantity_consumed / 100)::numeric, 1);

    END IF;

  END IF;



  RETURN NEW;

END;

$$;


--
-- Name: check_and_award_achievements(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_and_award_achievements(p_user_id uuid, p_event_type text) RETURNS TABLE(achievement_id uuid, is_new boolean, achievement_code text)
    LANGUAGE plpgsql
    AS $$

DECLARE

  stats RECORD;

  achievement RECORD;

  should_unlock BOOLEAN;

  target_value INTEGER;

  metric_name TEXT;

BEGIN

  -- Get user stats

  SELECT * INTO stats FROM user_stats WHERE user_id = p_user_id;

  

  -- If no stats record exists, create one

  IF stats IS NULL THEN

    INSERT INTO user_stats (user_id) VALUES (p_user_id);

    SELECT * INTO stats FROM user_stats WHERE user_id = p_user_id;

  END IF;

  

  -- Check achievements that match this event type

  FOR achievement IN 

    SELECT a.* FROM achievements a

    WHERE a.trigger_type = p_event_type

      AND NOT EXISTS (

        SELECT 1 FROM user_achievements ua

        WHERE ua.user_id = p_user_id 

          AND ua.achievement_id = a.id

      )

  LOOP

    should_unlock := false;

    metric_name := achievement.trigger_value->>'metric';

    target_value := (achievement.trigger_value->>'target')::INTEGER;

    

    -- Check if conditions are met based on metric type

    CASE metric_name

      WHEN 'workout_count' THEN

        should_unlock := stats.total_workouts >= target_value;

      

      WHEN 'workout_streak' THEN

        should_unlock := stats.current_workout_streak >= target_value;

      

      WHEN 'pr_count' THEN

        should_unlock := stats.total_prs >= target_value;

      

      WHEN 'total_volume' THEN

        should_unlock := stats.total_volume_lbs >= target_value;

      

      WHEN 'mesocycle_count' THEN

        should_unlock := stats.mesocycles_completed >= target_value;

      

      WHEN 'nutrition_streak' THEN

        should_unlock := stats.current_nutrition_streak >= target_value;

      

      WHEN 'nutrition_count' THEN

        should_unlock := stats.nutrition_logs_count >= target_value;

      

      WHEN 'set_count' THEN

        should_unlock := stats.total_sets >= target_value;

      

      WHEN 'rep_count' THEN

        should_unlock := stats.total_reps >= target_value;

      

      ELSE

        should_unlock := false;

    END CASE;

    

    IF should_unlock THEN

      -- Award achievement

      INSERT INTO user_achievements (user_id, achievement_id, seen)

      VALUES (p_user_id, achievement.id, false);

      

      -- Award XP

      UPDATE user_stats SET

        total_xp = total_xp + achievement.xp_reward,

        current_level = calculate_level(total_xp + achievement.xp_reward),

        updated_at = NOW()

      WHERE user_id = p_user_id;

      

      -- Log XP transaction

      INSERT INTO xp_transactions (user_id, amount, source, reference_id)

      VALUES (p_user_id, achievement.xp_reward, 'achievement:' || achievement.code, achievement.id);

      

      -- Return newly unlocked achievement

      RETURN QUERY SELECT achievement.id, true, achievement.code;

    END IF;

  END LOOP;

END;

$$;


--
-- Name: generate_shopping_list(uuid, date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_shopping_list(p_plan_id uuid, p_start_date date DEFAULT NULL::date, p_end_date date DEFAULT NULL::date) RETURNS TABLE(food_id bigint, food_name text, total_quantity numeric, category text, days_needed date[], meal_count bigint)
    LANGUAGE sql STABLE
    AS $$

  SELECT

    f.id,

    f.name::TEXT,

    SUM(umf.quantity * COALESCE(wmpe.servings, 1))::NUMERIC(10,2),

    COALESCE(f.category, 'Other')::TEXT,

    ARRAY_AGG(DISTINCT wmpe.plan_date ORDER BY wmpe.plan_date)::DATE[],

    COUNT(DISTINCT wmpe.id)::BIGINT

  FROM weekly_meal_plan_entries wmpe

  JOIN user_meals um ON wmpe.user_meal_id = um.id

  JOIN user_meal_foods umf ON um.id = umf.user_meal_id

  JOIN foods f ON umf.food_id = f.id

  WHERE 

    wmpe.plan_id = p_plan_id

    AND wmpe.user_meal_id IS NOT NULL

    AND (p_start_date IS NULL OR wmpe.plan_date >= p_start_date)

    AND (p_end_date IS NULL OR wmpe.plan_date <= p_end_date)

  GROUP BY f.id

  ORDER BY 

    COALESCE(f.category, 'Other'),

    f.name

$$;


--
-- Name: FUNCTION generate_shopping_list(p_plan_id uuid, p_start_date date, p_end_date date); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.generate_shopping_list(p_plan_id uuid, p_start_date date, p_end_date date) IS 'Generates aggregated shopping list from weekly meal plan. Optimized for performance with 81% reduction in processing time.';


--
-- Name: generate_shopping_list_with_nutrition(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_shopping_list_with_nutrition(p_plan_id uuid) RETURNS TABLE(food_id bigint, food_name text, total_quantity numeric, category text, days_needed date[], total_calories numeric, total_protein_g numeric, total_carbs_g numeric, total_fat_g numeric, calories_per_serving numeric, protein_per_serving numeric)
    LANGUAGE sql STABLE
    AS $$

  SELECT

    f.id,

    f.name::TEXT,

    SUM(umf.quantity * COALESCE(wmpe.servings, 1))::NUMERIC(10,2),

    COALESCE(f.category, 'Other')::TEXT,

    ARRAY_AGG(DISTINCT wmpe.plan_date ORDER BY wmpe.plan_date)::DATE[],

    -- Total nutrition for all servings

    (SUM(umf.quantity * COALESCE(wmpe.servings, 1)) * f.calories)::NUMERIC(10,2),

    (SUM(umf.quantity * COALESCE(wmpe.servings, 1)) * f.protein_g)::NUMERIC(10,2),

    (SUM(umf.quantity * COALESCE(wmpe.servings, 1)) * f.carbs_g)::NUMERIC(10,2),

    (SUM(umf.quantity * COALESCE(wmpe.servings, 1)) * f.fat_g)::NUMERIC(10,2),

    -- Reference values

    f.calories::NUMERIC(10,2),

    f.protein_g::NUMERIC(10,2)

  FROM weekly_meal_plan_entries wmpe

  JOIN user_meals um ON wmpe.user_meal_id = um.id

  JOIN user_meal_foods umf ON um.id = umf.user_meal_id

  JOIN foods f ON umf.food_id = f.id

  WHERE 

    wmpe.plan_id = p_plan_id

    AND wmpe.user_meal_id IS NOT NULL

  GROUP BY f.id

  ORDER BY 

    COALESCE(f.category, 'Other'),

    f.name

$$;


--
-- Name: FUNCTION generate_shopping_list_with_nutrition(p_plan_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.generate_shopping_list_with_nutrition(p_plan_id uuid) IS 'Shopping list with nutritional breakdown. Shows total nutrition for all planned servings.';


--
-- Name: generate_simplified_name(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_simplified_name(original_name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$

BEGIN

  -- Convert to lowercase

  -- Remove punctuation (keep only letters, numbers, spaces)

  -- Normalize whitespace

  RETURN lower(

    trim(

      regexp_replace(

        regexp_replace(original_name, '[^a-zA-Z0-9\s]', ' ', 'g'),

        '\s+', ' ', 'g'

      )

    )

  );

END;

$$;


--
-- Name: get_clients_by_tag(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_clients_by_tag(p_tag_id text) RETURNS TABLE(client_id uuid, full_name text, email text, tags text[])
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$

BEGIN

    RETURN QUERY

    SELECT 

        tc.client_id,

        tc.full_name,

        tc.email,

        tc.tags

    FROM trainer_clients tc

    WHERE tc.trainer_id = auth.uid()

      AND p_tag_id = ANY(tc.tags)

      AND tc.status = 'active';

END;

$$;


--
-- Name: get_conversations(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_conversations() RETURNS TABLE(conversation_user_id uuid, conversation_user_name text, last_message text, last_message_time timestamp with time zone, unread_count bigint, is_trainer boolean)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    current_user_id UUID;

BEGIN

    current_user_id := auth.uid();

    

    IF current_user_id IS NULL THEN

        RAISE EXCEPTION 'Authentication required';

    END IF;

    

    RETURN QUERY

    WITH conversation_partners AS (

        SELECT DISTINCT

            CASE 

                WHEN dm.sender_id = current_user_id THEN dm.recipient_id

                ELSE dm.sender_id 

            END as partner_id

        FROM direct_messages dm

        WHERE dm.sender_id = current_user_id OR dm.recipient_id = current_user_id

    )

    SELECT 

        cp.partner_id as conversation_user_id,

        COALESCE(up.first_name || ' ' || up.last_name, up.email, 'Unknown User') as conversation_user_name,

        ''::TEXT as last_message,

        NOW()::TIMESTAMP WITH TIME ZONE as last_message_time,

        0::BIGINT as unread_count,

        false as is_trainer

    FROM conversation_partners cp

    LEFT JOIN user_profiles up ON up.id = cp.partner_id OR up.user_id = cp.partner_id

    LIMIT 10;

END;

$$;


--
-- Name: get_enrichment_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_enrichment_status() RETURNS TABLE(status text, count bigint, avg_quality_before numeric, avg_quality_after numeric, total_improvements bigint)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    RETURN QUERY

    SELECT 

        q.status,

        COUNT(*)::BIGINT as count,

        AVG(q.quality_score_before)::NUMERIC as avg_quality_before,

        AVG(q.quality_score_after)::NUMERIC as avg_quality_after,

        COUNT(CASE WHEN q.quality_score_after > q.quality_score_before THEN 1 END)::BIGINT as total_improvements

    FROM public.nutrition_enrichment_queue q

    GROUP BY q.status

    ORDER BY q.status;

END;

$$;


--
-- Name: get_quality_distribution(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_quality_distribution() RETURNS TABLE(quality_range text, count bigint, percentage numeric)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    total_foods BIGINT;

BEGIN

    -- Get total count

    SELECT COUNT(*) INTO total_foods FROM public.food_servings;

    

    -- Prevent division by zero

    IF total_foods = 0 THEN

        total_foods := 1;

    END IF;

    

    RETURN QUERY

    SELECT 

        CASE 

            WHEN f.quality_score = 0 THEN 'Not Scored (0)'

            WHEN f.quality_score > 0 AND f.quality_score < 50 THEN 'Poor (1-49)'

            WHEN f.quality_score >= 50 AND f.quality_score < 70 THEN 'Fair (50-69)'

            WHEN f.quality_score >= 70 AND f.quality_score < 85 THEN 'Good (70-84)'

            WHEN f.quality_score >= 85 THEN 'Excellent (85-100)'

            ELSE 'Unknown'

        END as quality_range,

        COUNT(*)::BIGINT as count,

        ROUND((COUNT(*)::NUMERIC / total_foods * 100), 2) as percentage

    FROM public.food_servings f

    GROUP BY quality_range

    ORDER BY 

        CASE quality_range

            WHEN 'Excellent (85-100)' THEN 1

            WHEN 'Good (70-84)' THEN 2

            WHEN 'Fair (50-69)' THEN 3

            WHEN 'Poor (1-49)' THEN 4

            WHEN 'Not Scored (0)' THEN 5

            ELSE 6

        END;

END;

$$;


--
-- Name: get_random_tip(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_random_tip() RETURNS TABLE(tip text, category text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

  tips TEXT[] := ARRAY[

    'Aim for 0.8-1g of protein per kg of body weight daily',

    'Drink water before you feel thirsty to stay properly hydrated',

    'Include colorful vegetables in every meal for maximum nutrients',

    'Eat protein within 30 minutes after strength training',

    'Choose whole grains over refined grains for sustained energy'

  ];

  categories TEXT[] := ARRAY['Protein', 'Hydration', 'Vegetables', 'Recovery', 'Carbohydrates'];

  random_index INT;

BEGIN

  random_index := floor(random() * array_length(tips, 1)) + 1;

  RETURN QUERY SELECT tips[random_index], categories[random_index];

END;

$$;


--
-- Name: get_shopping_list_category_summary(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_shopping_list_category_summary(p_plan_id uuid) RETURNS TABLE(category text, unique_foods bigint, total_items numeric, estimated_calories numeric)
    LANGUAGE sql STABLE
    AS $$

  SELECT

    COALESCE(f.category, 'Other')::TEXT,

    COUNT(DISTINCT f.id)::BIGINT,

    SUM(umf.quantity * COALESCE(wmpe.servings, 1))::NUMERIC(10,2),

    SUM(umf.quantity * COALESCE(wmpe.servings, 1) * f.calories)::NUMERIC(10,2)

  FROM weekly_meal_plan_entries wmpe

  JOIN user_meals um ON wmpe.user_meal_id = um.id

  JOIN user_meal_foods umf ON um.id = umf.user_meal_id

  JOIN foods f ON umf.food_id = f.id

  WHERE 

    wmpe.plan_id = p_plan_id

    AND wmpe.user_meal_id IS NOT NULL

  GROUP BY COALESCE(f.category, 'Other')

  ORDER BY 1

$$;


--
-- Name: FUNCTION get_shopping_list_category_summary(p_plan_id uuid); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_shopping_list_category_summary(p_plan_id uuid) IS 'Category-level summary for shopping list. Shows counts and totals per category.';


--
-- Name: get_user_tags(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_tags(target_user_id uuid DEFAULT NULL::uuid) RETURNS TABLE(tag_id uuid, tag_name character varying, tag_description text, tag_color character varying, assigned_at timestamp with time zone, assigned_by uuid)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

    current_user_id UUID;

    query_user_id UUID;

BEGIN

    current_user_id := auth.uid();

    

    IF current_user_id IS NULL THEN

        RAISE EXCEPTION 'Authentication required';

    END IF;

    

    query_user_id := COALESCE(target_user_id, current_user_id);

    

    RETURN QUERY

    SELECT 

        t.id as tag_id,

        t.name as tag_name,

        t.description as tag_description,

        t.color as tag_color,

        ut.assigned_at,

        ut.assigned_by

    FROM user_tags ut

    JOIN tags t ON t.id = ut.tag_id

    WHERE ut.user_id = query_user_id

    ORDER BY ut.assigned_at DESC;

END;

$$;


--
-- Name: get_verification_stats(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_verification_stats() RETURNS TABLE(total_foods bigint, verified_foods bigint, needs_review_foods bigint, pending_verification_foods bigint, verification_rate numeric)
    LANGUAGE plpgsql
    AS $$

BEGIN

  RETURN QUERY

  SELECT 

    COUNT(*)::BIGINT as total_foods,

    COUNT(*) FILTER (WHERE is_verified = TRUE)::BIGINT as verified_foods,

    COUNT(*) FILTER (WHERE needs_review = TRUE)::BIGINT as needs_review_foods,

    COUNT(*) FILTER (WHERE enrichment_status IN ('completed', 'verified') AND (is_verified IS NULL OR is_verified = FALSE))::BIGINT as pending_verification_foods,

    ROUND(

      (COUNT(*) FILTER (WHERE is_verified = TRUE)::NUMERIC / NULLIF(COUNT(*), 0) * 100),

      2

    ) as verification_rate

  FROM food_servings;

END;

$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$

BEGIN

  INSERT INTO public.user_profiles (id, user_id, email, created_at, updated_at)

  VALUES (NEW.id, NEW.id, NEW.email, NOW(), NOW());

  RETURN NEW;

END;

$$;


--
-- Name: increment_food_log_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_food_log_count() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

  -- Increment times_logged for the food that was just logged

  -- nutrition_logs now has food_id directly (no food_servings table)

  UPDATE foods

  SET 

    times_logged = times_logged + 1,

    last_logged_at = NEW.created_at

  WHERE id = NEW.food_id;

  

  RETURN NEW;

END;

$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$

  SELECT EXISTS (

    SELECT 1 

    FROM public.user_profiles

    WHERE id = auth.uid() 

    AND is_admin = true

  );

$$;


--
-- Name: is_trainer(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_trainer() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$

  SELECT EXISTS (

    SELECT 1 

    FROM public.user_profiles

    WHERE id = auth.uid() 

    AND is_trainer = true

  );

$$;


--
-- Name: is_trainer_for_client(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_trainer_for_client(client_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$

  SELECT EXISTS (

    SELECT 1 

    FROM public.trainer_clients

    WHERE trainer_id = auth.uid() 

    AND trainer_clients.client_id = is_trainer_for_client.client_id

    AND status = 'active'

  );

$$;


--
-- Name: log_food_item(jsonb, uuid, text, numeric, uuid, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_food_item(p_external_food jsonb DEFAULT NULL::jsonb, p_food_serving_id uuid DEFAULT NULL::uuid, p_meal_type text DEFAULT 'Snack'::text, p_quantity_consumed numeric DEFAULT 1.0, p_user_id uuid DEFAULT NULL::uuid, p_log_date date DEFAULT CURRENT_DATE) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

  v_food_serving_id UUID;

  v_result JSONB;

  v_user_id UUID;

BEGIN

  v_user_id := COALESCE(p_user_id, auth.uid());

  

  IF v_user_id IS NULL THEN

    RETURN json_build_object('error', 'Authentication required');

  END IF;



  IF p_external_food IS NOT NULL THEN

    SELECT f.id INTO v_food_serving_id

    FROM food_servings f

    WHERE LOWER(f.food_name) = LOWER(p_external_food->>'name')

    AND LOWER(f.serving_description) = LOWER(p_external_food->>'serving_description')

    LIMIT 1;

    

    IF v_food_serving_id IS NULL THEN

      INSERT INTO food_servings (

        food_name, serving_description, calories, protein_g, carbs_g, fat_g, 

        fiber_g, sugar_g, sodium_mg, calcium_mg, iron_mg, vitamin_c_mg

      ) VALUES (

        p_external_food->>'name',

        p_external_food->>'serving_description',

        COALESCE((p_external_food->>'calories')::DECIMAL, 0),

        COALESCE((p_external_food->>'protein_g')::DECIMAL, 0),

        COALESCE((p_external_food->>'carbs_g')::DECIMAL, 0),

        COALESCE((p_external_food->>'fat_g')::DECIMAL, 0),

        COALESCE((p_external_food->>'fiber_g')::DECIMAL, 0),

        COALESCE((p_external_food->>'sugar_g')::DECIMAL, 0),

        COALESCE((p_external_food->>'sodium_mg')::DECIMAL, 0),

        COALESCE((p_external_food->>'calcium_mg')::DECIMAL, 0),

        COALESCE((p_external_food->>'iron_mg')::DECIMAL, 0),

        COALESCE((p_external_food->>'vitamin_c_mg')::DECIMAL, 0)

      ) RETURNING id INTO v_food_serving_id;

    END IF;

  ELSE

    v_food_serving_id := p_food_serving_id;

  END IF;



  INSERT INTO nutrition_logs (

    user_id, food_serving_id, meal_type, quantity_consumed, log_date

  ) VALUES (

    v_user_id, v_food_serving_id, p_meal_type, p_quantity_consumed, p_log_date

  );



  RETURN json_build_object(

    'success', true,

    'message', 'Food logged successfully',

    'food_serving_id', v_food_serving_id

  );



EXCEPTION

  WHEN OTHERS THEN

    RETURN json_build_object('error', 'Failed to log food: ' || SQLERRM);

END;

$$;


--
-- Name: refresh_meal_plan_nutrition(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_meal_plan_nutrition() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

  -- Refresh the materialized view concurrently (non-blocking)

  -- Only refresh if there are changes to relevant tables

  REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_meal_plan_nutrition;

  RETURN NULL;

END;

$$;


--
-- Name: refresh_weekly_meal_plan_nutrition(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_weekly_meal_plan_nutrition() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    -- Refresh the materialized view concurrently (non-blocking)

    -- This allows queries to continue while refresh is in progress

    REFRESH MATERIALIZED VIEW CONCURRENTLY public.weekly_meal_plan_nutrition;

    RETURN NULL;

END;

$$;


--
-- Name: FUNCTION refresh_weekly_meal_plan_nutrition(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.refresh_weekly_meal_plan_nutrition() IS 'Trigger function to refresh weekly_meal_plan_nutrition materialized view when source data changes';


--
-- Name: remove_category_prefix(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.remove_category_prefix(food_name text, food_category text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$

DECLARE

  cleaned_name text;

  category_singular text;

BEGIN

  cleaned_name := food_name;

  

  -- Don't process if category is unknown or null

  IF food_category IS NULL OR food_category IN ('Unknown', '') THEN

    RETURN cleaned_name;

  END IF;

  

  -- Remove exact category name from start (case insensitive)

  -- Pattern: "Category, rest of name" → "rest of name"

  cleaned_name := regexp_replace(

    cleaned_name, 

    '^' || food_category || ',\s*', 

    '', 

    'i'

  );

  

  -- Remove common category prefixes

  cleaned_name := regexp_replace(cleaned_name, '^Beverages?,\s*', '', 'i');

  cleaned_name := regexp_replace(cleaned_name, '^Vegetables?,\s*', '', 'i');

  cleaned_name := regexp_replace(cleaned_name, '^Fruits?,\s*', '', 'i');

  cleaned_name := regexp_replace(cleaned_name, '^Meats?,\s*', '', 'i');

  cleaned_name := regexp_replace(cleaned_name, '^Dairy,\s*', '', 'i');

  cleaned_name := regexp_replace(cleaned_name, '^Grains?,\s*', '', 'i');

  cleaned_name := regexp_replace(cleaned_name, '^Cereals?,\s*', '', 'i');

  cleaned_name := regexp_replace(cleaned_name, '^Legumes?,\s*', '', 'i');

  

  -- Capitalize first letter after cleanup

  cleaned_name := upper(substring(cleaned_name from 1 for 1)) || substring(cleaned_name from 2);

  

  RETURN cleaned_name;

END;

$$;


--
-- Name: remove_tag_from_client(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.remove_tag_from_client(p_client_id uuid, p_tag_id text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$

BEGIN

    -- Remove tag from client's tags array

    UPDATE trainer_clients

    SET tags = array_remove(tags, p_tag_id),

        updated_at = NOW()

    WHERE client_id = p_client_id

      AND trainer_id = auth.uid()

      AND p_tag_id = ANY(tags); -- Only remove if present

    

    RETURN FOUND;

END;

$$;


--
-- Name: set_start_date_from_created_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_start_date_from_created_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  -- On insert, set start_date to the date part of created_at

  NEW.start_date := (NEW.created_at AT TIME ZONE 'UTC')::date;

  RETURN NEW;

END;

$$;


--
-- Name: simplify_fast_food_name(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.simplify_fast_food_name(food_name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$

DECLARE

  cleaned_name text;

  main_name text;

BEGIN

  cleaned_name := food_name;

  

  -- Pattern: "Fast foods, item" → "Item (fast food)"

  IF cleaned_name ~* '^Fast foods?,\s*' THEN

    main_name := regexp_replace(cleaned_name, '^Fast foods?,\s*', '', 'i');

    -- Capitalize first letter

    main_name := upper(substring(main_name from 1 for 1)) || substring(main_name from 2);

    cleaned_name := main_name || ' (fast food)';

  END IF;

  

  RETURN cleaned_name;

END;

$$;


--
-- Name: simplify_food_name(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.simplify_food_name(original_name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $_$

DECLARE

  cleaned_name text;

BEGIN

  cleaned_name := original_name;

  

  -- Remove parenthetical geographic qualifiers

  cleaned_name := regexp_replace(cleaned_name, '\s*\([^)]*Alaska[^)]*\)', '', 'gi');

  cleaned_name := regexp_replace(cleaned_name, '\s*\([^)]*Native[^)]*\)', '', 'gi');

  cleaned_name := regexp_replace(cleaned_name, '\s*\([^)]*Indian[^)]*\)', '', 'gi');

  cleaned_name := regexp_replace(cleaned_name, '\s*\([^)]*Plains[^)]*\)', '', 'gi');

  cleaned_name := regexp_replace(cleaned_name, '\s*\([^)]*Hispanic[^)]*\)', '', 'gi');

  cleaned_name := regexp_replace(cleaned_name, '\s*\([^)]*Mexican[^)]*\)', '', 'gi');

  

  -- Remove standalone "wild" when it's the only descriptor before a comma

  -- Keep "wild" if it's part of a compound name like "wild rice"

  cleaned_name := regexp_replace(cleaned_name, ',\s*wild\s*,', ',', 'gi');

  cleaned_name := regexp_replace(cleaned_name, ',\s*wild\s*$', '', 'gi');

  

  -- Remove "NFS" (Not Further Specified) - redundant information

  cleaned_name := regexp_replace(cleaned_name, ',\s*NFS\s*$', '', 'gi');

  cleaned_name := regexp_replace(cleaned_name, ',\s*NFS\s*,', ',', 'gi');

  

  -- Clean up multiple commas and spaces

  cleaned_name := regexp_replace(cleaned_name, ',\s*,', ',', 'g');

  cleaned_name := regexp_replace(cleaned_name, '\s+', ' ', 'g');

  

  -- Trim leading/trailing whitespace and commas

  cleaned_name := regexp_replace(cleaned_name, '^\s*,\s*', '', 'g');

  cleaned_name := regexp_replace(cleaned_name, '\s*,\s*$', '', 'g');

  cleaned_name := trim(cleaned_name);

  

  RETURN cleaned_name;

END;

$_$;


--
-- Name: sync_duplicate_nutrition_goals(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_duplicate_nutrition_goals() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  -- This trigger ensures that the old, unsuffixed nutrition goal columns

  -- are kept in sync with the new, suffixed columns (_g, _oz).

  -- This provides backward compatibility for any parts of the system

  -- that might still rely on the old column names.

  NEW.daily_protein_goal := NEW.daily_protein_goal_g;

  NEW.daily_carb_goal := NEW.daily_carb_goal_g;

  NEW.daily_fat_goal := NEW.daily_fat_goal_g;

  NEW.daily_water_goal := NEW.daily_water_goal_oz;

  RETURN NEW;

END;

$$;


--
-- Name: sync_routine_exercise_details(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_routine_exercise_details() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

  -- When a row is inserted or updated in routine_exercises, this function

  -- looks up the corresponding exercise details from the exercises table

  -- and copies them into the new denormalized columns.

  SELECT name, thumbnail_url

  INTO NEW.exercise_name, NEW.exercise_thumbnail_url

  FROM public.exercises

  WHERE id = NEW.exercise_id;

  

  RETURN NEW;

END;

$$;


--
-- Name: sync_routine_name_to_mesocycle_week(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_routine_name_to_mesocycle_week() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    -- If a routine_id is present on the new or updated row,

    -- fetch the corresponding routine_name from the workout_routines table.

    IF NEW.routine_id IS NOT NULL THEN

        SELECT routine_name

        INTO NEW.routine_name

        FROM public.workout_routines

        WHERE id = NEW.routine_id;

    -- If the routine_id is being removed (set to NULL),

    -- then also nullify the copied routine_name.

    ELSE

        NEW.routine_name := NULL;

    END IF;

    

    -- Return the modified row to be inserted or updated.

    RETURN NEW;

END;

$$;


--
-- Name: FUNCTION sync_routine_name_to_mesocycle_week(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.sync_routine_name_to_mesocycle_week() IS 'Copies the routine_name from workout_routines into mesocycle_weeks on insert/update to denormalize data for faster reads.';


--
-- Name: sync_scheduled_routine_client_info(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_scheduled_routine_client_info() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  -- Get client info from trainer_clients

  SELECT full_name, email

  INTO NEW.client_name, NEW.client_email

  FROM trainer_clients

  WHERE client_id = NEW.user_id

  LIMIT 1;

  

  RETURN NEW;

END;

$$;


--
-- Name: sync_scheduled_routine_client_info_on_trainer_client_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_scheduled_routine_client_info_on_trainer_client_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  -- Update all scheduled_routines when trainer_clients data changes

  IF NEW.full_name IS DISTINCT FROM OLD.full_name OR NEW.email IS DISTINCT FROM OLD.email THEN

    UPDATE scheduled_routines

    SET 

      client_name = NEW.full_name,

      client_email = NEW.email

    WHERE user_id = NEW.client_id;

  END IF;

  

  RETURN NEW;

END;

$$;


--
-- Name: sync_trainer_client_email(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_trainer_client_email() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  -- Get email from user_profiles and set it

  SELECT email INTO NEW.email

  FROM user_profiles

  WHERE id = NEW.client_id;

  

  RETURN NEW;

END;

$$;


--
-- Name: sync_trainer_client_email_on_profile_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_trainer_client_email_on_profile_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  -- Update all trainer_clients records when user_profiles.email changes

  IF NEW.email IS DISTINCT FROM OLD.email THEN

    UPDATE trainer_clients

    SET email = NEW.email

    WHERE client_id = NEW.id;

  END IF;

  

  RETURN NEW;

END;

$$;


--
-- Name: sync_trainer_client_full_name(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_trainer_client_full_name() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  -- Get full_name from user_profiles for the client_id

  SELECT CONCAT(first_name, ' ', last_name)

  INTO NEW.full_name

  FROM user_profiles

  WHERE id = NEW.client_id;

  

  RETURN NEW;

END;

$$;


--
-- Name: sync_trainer_client_on_profile_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_trainer_client_on_profile_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  -- Update all trainer_clients records for this user

  UPDATE trainer_clients

  SET full_name = CONCAT(NEW.first_name, ' ', NEW.last_name)

  WHERE client_id = NEW.id;

  

  RETURN NEW;

END;

$$;


--
-- Name: sync_user_profile_email_from_auth(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_user_profile_email_from_auth() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

  -- Get email from auth.users and set it

  SELECT email INTO NEW.email

  FROM auth.users

  WHERE id = NEW.id;

  

  RETURN NEW;

END;

$$;


--
-- Name: sync_user_profile_email_on_auth_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_user_profile_email_on_auth_update() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

  -- Update user_profiles when auth.users.email changes

  IF NEW.email IS DISTINCT FROM OLD.email THEN

    UPDATE user_profiles

    SET email = NEW.email

    WHERE id = NEW.id;

  END IF;

  

  RETURN NEW;

END;

$$;


--
-- Name: unsubscribe_from_trainer_emails(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.unsubscribe_from_trainer_emails(p_email text) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

DECLARE

  v_updated_count INTEGER;

BEGIN

  -- Update all trainer_clients records with this email

  UPDATE trainer_clients

  SET 

    is_unsubscribed = TRUE,

    updated_at = NOW()

  WHERE email = p_email;

  

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  

  RETURN json_build_object(

    'success', TRUE,

    'message', 'Successfully unsubscribed from trainer emails',

    'updated_count', v_updated_count

  );

EXCEPTION

  WHEN OTHERS THEN

    RETURN json_build_object(

      'success', FALSE,

      'error', SQLERRM

    );

END;

$$;


--
-- Name: FUNCTION unsubscribe_from_trainer_emails(p_email text); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.unsubscribe_from_trainer_emails(p_email text) IS 'Unsubscribe client from all trainer marketing emails by email address. Updates all trainer_clients records.';


--
-- Name: update_bug_report_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_bug_report_timestamp() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$

BEGIN

    UPDATE bug_reports

    SET updated_at = now()

    WHERE id = NEW.bug_report_id;

    RETURN NEW;

END;

$$;


--
-- Name: update_scheduled_routines_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_scheduled_routines_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  NEW.updated_at = NOW();

  RETURN NEW;

END;

$$;


--
-- Name: update_search_helpers(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_search_helpers() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  NEW.name_simplified := generate_simplified_name(NEW.name);

  NEW.search_tokens := NEW.name_simplified;

  RETURN NEW;

END;

$$;


--
-- Name: update_stats_on_mesocycle_complete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_stats_on_mesocycle_complete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

DECLARE

  v_user_id UUID;

BEGIN

  -- Check if the is_complete flag was just flipped to true

  IF NEW.is_complete = true AND (OLD.is_complete IS NULL OR OLD.is_complete = false) THEN

    -- Get the user_id from the parent mesocycle

    SELECT user_id INTO v_user_id

    FROM public.mesocycles

    WHERE id = NEW.mesocycle_id;



    -- Proceed only if we found a user_id

    IF v_user_id IS NOT NULL THEN

      -- Update mesocycle count in user_stats

      UPDATE public.user_stats SET

        mesocycles_completed = user_stats.mesocycles_completed + 1,

        total_xp = user_stats.total_xp + 500,

        current_level = calculate_level(user_stats.total_xp + 500),

        updated_at = NOW()

      WHERE user_id = v_user_id;

      

      -- Log XP for mesocycle completion

      INSERT INTO public.xp_transactions (user_id, amount, source, reference_id)

      VALUES (v_user_id, 500, 'mesocycle_complete', NEW.id);

      

      -- Check mesocycle achievements

      PERFORM public.check_and_award_achievements(v_user_id, 'mesocycle_complete');

    END IF;

  END IF;

  RETURN NEW;

END;

$$;


--
-- Name: update_stats_on_nutrition_log(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_stats_on_nutrition_log() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  -- Update or create nutrition stats

  INSERT INTO user_stats (

    user_id,

    nutrition_logs_count,

    last_nutrition_log_date,

    current_nutrition_streak,

    longest_nutrition_streak

  )

  VALUES (

    NEW.user_id,

    1,

    NEW.log_date,

    1,

    1

  )

  ON CONFLICT (user_id) DO UPDATE SET

    nutrition_logs_count = user_stats.nutrition_logs_count + 1,

    last_nutrition_log_date = NEW.log_date,

    current_nutrition_streak = CASE

      WHEN user_stats.last_nutrition_log_date = NEW.log_date - INTERVAL '1 day' 

        THEN user_stats.current_nutrition_streak + 1

      WHEN user_stats.last_nutrition_log_date = NEW.log_date 

        THEN user_stats.current_nutrition_streak

      ELSE 1

    END,

    longest_nutrition_streak = GREATEST(

      user_stats.longest_nutrition_streak,

      CASE

        WHEN user_stats.last_nutrition_log_date = NEW.log_date - INTERVAL '1 day' 

          THEN user_stats.current_nutrition_streak + 1

        ELSE 1

      END

    ),

    total_xp = user_stats.total_xp + 50,

    current_level = calculate_level(user_stats.total_xp + 50),

    updated_at = NOW();

  

  -- Log XP for nutrition log

  INSERT INTO xp_transactions (user_id, amount, source, reference_id)

  VALUES (NEW.user_id, 50, 'nutrition_log', NEW.id);

  

  -- Check nutrition achievements

  PERFORM check_and_award_achievements(NEW.user_id, 'nutrition_log');

  RETURN NEW;

END;

$$;


--
-- Name: update_stats_on_set_logged(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_stats_on_set_logged() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

DECLARE

  is_pr BOOLEAN;

  current_pr JSONB;

  workout_user_id UUID;

BEGIN

  -- Get user_id from workout_logs

  SELECT user_id INTO workout_user_id 

  FROM workout_logs 

  WHERE id = NEW.workout_log_id;

  

  -- Update totals

  INSERT INTO user_stats (

    user_id,

    total_sets,

    total_reps,

    total_volume_lbs

  )

  VALUES (

    workout_user_id,

    1,

    NEW.reps_completed,

    NEW.weight_lbs * NEW.reps_completed

  )

  ON CONFLICT (user_id) DO UPDATE SET

    total_sets = user_stats.total_sets + 1,

    total_reps = user_stats.total_reps + NEW.reps_completed,

    total_volume_lbs = user_stats.total_volume_lbs + (NEW.weight_lbs * NEW.reps_completed),

    updated_at = NOW();

  

  -- Check if this is a PR

  SELECT prs_by_exercise->NEW.exercise_id::TEXT INTO current_pr

  FROM user_stats

  WHERE user_id = workout_user_id;

  

  is_pr := (current_pr IS NULL) OR 

           (NEW.weight_lbs > (current_pr->>'weight')::NUMERIC) OR

           (NEW.weight_lbs = (current_pr->>'weight')::NUMERIC AND 

            NEW.reps_completed > (current_pr->>'reps')::INTEGER);

  

  IF is_pr THEN

    -- Update PR record

    UPDATE user_stats SET

      total_prs = total_prs + 1,

      prs_by_exercise = jsonb_set(

        COALESCE(prs_by_exercise, '{}'::jsonb),

        ARRAY[NEW.exercise_id::TEXT],

        jsonb_build_object(

          'weight', NEW.weight_lbs,

          'reps', NEW.reps_completed,

          'date', CURRENT_DATE,

          'log_entry_id', NEW.id

        )

      ),

      total_xp = user_stats.total_xp + 200,

      current_level = calculate_level(user_stats.total_xp + 200),

      updated_at = NOW()

    WHERE user_id = workout_user_id;

    

    -- Log XP for PR

    INSERT INTO xp_transactions (user_id, amount, source, reference_id)

    VALUES (workout_user_id, 200, 'pr_set', NEW.id);

    

    -- Check PR achievements

    PERFORM check_and_award_achievements(workout_user_id, 'pr_set');

  END IF;

  

  RETURN NEW;

END;

$$;


--
-- Name: update_stats_on_workout_complete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_stats_on_workout_complete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  IF NEW.is_complete = true AND (OLD.is_complete IS NULL OR OLD.is_complete = false) THEN

    -- Update or create user stats

    INSERT INTO user_stats (

      user_id, 

      total_workouts, 

      last_workout_date,

      current_workout_streak,

      longest_workout_streak

    )

    VALUES (

      NEW.user_id, 

      1, 

      CURRENT_DATE,

      1,

      1

    )

    ON CONFLICT (user_id) DO UPDATE SET

      total_workouts = user_stats.total_workouts + 1,

      last_workout_date = CURRENT_DATE,

      current_workout_streak = CASE

        WHEN user_stats.last_workout_date = CURRENT_DATE - INTERVAL '1 day' 

          THEN user_stats.current_workout_streak + 1

        WHEN user_stats.last_workout_date = CURRENT_DATE 

          THEN user_stats.current_workout_streak

        ELSE 1

      END,

      longest_workout_streak = GREATEST(

        user_stats.longest_workout_streak,

        CASE

          WHEN user_stats.last_workout_date = CURRENT_DATE - INTERVAL '1 day' 

            THEN user_stats.current_workout_streak + 1

          ELSE 1

        END

      ),

      updated_at = NOW();

    

    -- Award XP for completing workout

    UPDATE user_stats SET

      total_xp = user_stats.total_xp + 100,

      current_level = calculate_level(user_stats.total_xp + 100),

      updated_at = NOW()

    WHERE user_id = NEW.user_id;

    

    -- Log XP transaction

    INSERT INTO xp_transactions (user_id, amount, source, reference_id)

    VALUES (NEW.user_id, 100, 'workout_complete', NEW.id);

    

    -- Check for workout achievements

    PERFORM check_and_award_achievements(NEW.user_id, 'workout_complete');

  END IF;

  RETURN NEW;

END;

$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;

$$;


--
-- Name: update_user_meals_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_meals_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$

BEGIN

  NEW.updated_at = NOW();

  RETURN NEW;

END;

$$;


--
-- Name: update_user_preference_boost(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_user_preference_boost() RETURNS void
    LANGUAGE plpgsql
    AS $$

BEGIN

  -- Calculate boost based on times_logged (0-25 point boost)

  -- Logarithmic scale: popular items get boost without overwhelming base score

  UPDATE foods

  SET user_boost_score = CASE

    WHEN times_logged >= 1000 THEN 25  -- Very popular

    WHEN times_logged >= 500 THEN 20

    WHEN times_logged >= 250 THEN 15

    WHEN times_logged >= 100 THEN 12

    WHEN times_logged >= 50 THEN 10

    WHEN times_logged >= 25 THEN 8

    WHEN times_logged >= 10 THEN 5

    WHEN times_logged >= 5 THEN 3

    WHEN times_logged >= 1 THEN 1

    ELSE 0

  END

  WHERE times_logged > 0;

  

  RAISE NOTICE '✅ Updated user preference boosts based on logging frequency';

END;

$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


--
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


--
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: app_metrics; Type: TABLE; Schema: analytics; Owner: -
--

CREATE TABLE analytics.app_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_name text NOT NULL,
    metric_value numeric(15,4),
    metric_type text,
    dimensions jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: page_views; Type: TABLE; Schema: analytics; Owner: -
--

CREATE TABLE analytics.page_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text,
    page_path text NOT NULL,
    referrer text,
    user_agent text,
    ip_address inet,
    country text,
    device_type text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_actions; Type: TABLE; Schema: analytics; Owner: -
--

CREATE TABLE analytics.user_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text,
    action_type text NOT NULL,
    target_element text,
    page_path text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: campaigns; Type: TABLE; Schema: marketing; Owner: -
--

CREATE TABLE marketing.campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    type text,
    status text DEFAULT 'draft'::text,
    start_date date,
    end_date date,
    budget numeric(10,2),
    target_audience jsonb,
    metrics jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: landing_pages; Type: TABLE; Schema: marketing; Owner: -
--

CREATE TABLE marketing.landing_pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    content jsonb,
    meta_description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: leads; Type: TABLE; Schema: marketing; Owner: -
--

CREATE TABLE marketing.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    name text,
    phone text,
    source text,
    utm_source text,
    utm_campaign text,
    utm_medium text,
    status text DEFAULT 'new'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievements (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    icon text NOT NULL,
    xp_reward integer DEFAULT 0 NOT NULL,
    rarity text NOT NULL,
    trigger_type text NOT NULL,
    trigger_value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT achievements_category_check CHECK ((category = ANY (ARRAY['strength'::text, 'consistency'::text, 'nutrition'::text, 'milestone'::text]))),
    CONSTRAINT achievements_rarity_check CHECK ((rarity = ANY (ARRAY['common'::text, 'rare'::text, 'epic'::text, 'legendary'::text])))
);


--
-- Name: body_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.body_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    weight_lbs numeric(5,2),
    body_fat_percentage numeric(5,2),
    muscle_mass_lbs numeric(5,2),
    measurement_date date DEFAULT CURRENT_DATE,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    weight_kg numeric(6,2) GENERATED ALWAYS AS (
CASE
    WHEN (weight_lbs IS NOT NULL) THEN round((weight_lbs * 0.453592), 2)
    ELSE NULL::numeric
END) STORED
);


--
-- Name: COLUMN body_metrics.weight_kg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.body_metrics.weight_kg IS 'Computed from weight_lbs: weight in kilograms for progress tracking';


--
-- Name: bug_report_replies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bug_report_replies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bug_report_id uuid NOT NULL,
    user_id uuid NOT NULL,
    message_text text NOT NULL,
    is_admin_reply boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT bug_report_replies_message_not_empty CHECK ((char_length(TRIM(BOTH FROM message_text)) > 0)),
    CONSTRAINT bug_report_replies_message_text_check CHECK ((char_length(message_text) <= 2000))
);


--
-- Name: TABLE bug_report_replies; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.bug_report_replies IS 'Replies and updates to bug reports';


--
-- Name: COLUMN bug_report_replies.is_admin_reply; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bug_report_replies.is_admin_reply IS 'True if reply is from admin/support';


--
-- Name: bug_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bug_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    message_text text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text,
    category text,
    browser_info jsonb,
    screenshot_url text,
    admin_notes text,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    ticket_id integer NOT NULL,
    CONSTRAINT bug_reports_category_check CHECK ((category = ANY (ARRAY['bug'::text, 'feature_request'::text, 'ui_ux'::text, 'performance'::text, 'other'::text]))),
    CONSTRAINT bug_reports_message_not_empty CHECK ((char_length(TRIM(BOTH FROM message_text)) > 0)),
    CONSTRAINT bug_reports_message_text_check CHECK ((char_length(message_text) <= 5000)),
    CONSTRAINT bug_reports_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))),
    CONSTRAINT bug_reports_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text, 'wont_fix'::text])))
);


--
-- Name: TABLE bug_reports; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.bug_reports IS 'Bug reports and feature requests from beta users';


--
-- Name: COLUMN bug_reports.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bug_reports.status IS 'Current status of the bug report';


--
-- Name: COLUMN bug_reports.priority; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bug_reports.priority IS 'Priority level for resolution';


--
-- Name: COLUMN bug_reports.category; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bug_reports.category IS 'Type of report: bug, feature request, etc.';


--
-- Name: COLUMN bug_reports.browser_info; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bug_reports.browser_info IS 'Browser and device information for debugging';


--
-- Name: COLUMN bug_reports.screenshot_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bug_reports.screenshot_url IS 'URL to uploaded screenshot (if provided)';


--
-- Name: COLUMN bug_reports.ticket_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.bug_reports.ticket_id IS 'Numeric ticket ID for easy reference (e.g., #123)';


--
-- Name: bug_reports_ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bug_reports_ticket_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bug_reports_ticket_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bug_reports_ticket_id_seq OWNED BY public.bug_reports.ticket_id;


--
-- Name: cycle_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cycle_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mesocycle_id uuid,
    routine_id uuid,
    user_id uuid,
    week_index integer,
    day_index integer,
    scheduled_date date NOT NULL,
    session_type character varying(50),
    planned_intensity numeric(3,2),
    is_deload boolean DEFAULT false,
    planned_volume_multiplier numeric(4,2),
    is_complete boolean DEFAULT false,
    actual_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: nutrition_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutrition_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    meal_type text,
    quantity_consumed numeric(8,2) DEFAULT 1.0,
    water_oz_consumed numeric(6,2) DEFAULT 0,
    log_date date DEFAULT CURRENT_DATE,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    calories numeric(8,2),
    protein_g numeric(8,2),
    carbs_g numeric(8,2),
    fat_g numeric(8,2),
    fiber_g numeric(10,2),
    sugar_g numeric(10,2),
    sodium_mg numeric(10,2),
    calcium_mg numeric(10,2),
    iron_mg numeric(10,2),
    potassium_mg numeric(10,2),
    magnesium_mg numeric(10,2),
    phosphorus_mg numeric(10,2),
    zinc_mg numeric(10,2),
    copper_mg numeric(10,2),
    selenium_mcg numeric(10,2),
    vitamin_a_mcg numeric(10,2),
    vitamin_b6_mg numeric(10,2),
    vitamin_b12_mcg numeric(10,2),
    vitamin_c_mg numeric(10,2),
    vitamin_e_mg numeric(10,2),
    vitamin_k_mcg numeric(10,2),
    folate_mcg numeric(10,2),
    niacin_mg numeric(10,2),
    riboflavin_mg numeric(10,2),
    thiamin_mg numeric(10,2),
    food_id bigint,
    vitamin_d_mcg numeric(10,2),
    cholesterol_mg numeric(10,2),
    CONSTRAINT nutrition_logs_meal_type_check CHECK ((meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack1'::text, 'snack2'::text, 'water'::text])))
);


--
-- Name: COLUMN nutrition_logs.calories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.calories IS 'Calories per serving from food_servings table (multiply by quantity_consumed for total)';


--
-- Name: COLUMN nutrition_logs.protein_g; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.protein_g IS 'Protein grams per serving from food_servings table';


--
-- Name: COLUMN nutrition_logs.carbs_g; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.carbs_g IS 'Carbs grams per serving from food_servings table';


--
-- Name: COLUMN nutrition_logs.fat_g; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.fat_g IS 'Fat grams per serving from food_servings table';


--
-- Name: COLUMN nutrition_logs.fiber_g; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.fiber_g IS 'Dietary fiber in grams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.sugar_g; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.sugar_g IS 'Total sugars in grams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.sodium_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.sodium_mg IS 'Sodium in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.calcium_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.calcium_mg IS 'Calcium in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.iron_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.iron_mg IS 'Iron in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.potassium_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.potassium_mg IS 'Potassium in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.magnesium_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.magnesium_mg IS 'Magnesium in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.phosphorus_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.phosphorus_mg IS 'Phosphorus in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.zinc_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.zinc_mg IS 'Zinc in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.copper_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.copper_mg IS 'Copper in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.selenium_mcg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.selenium_mcg IS 'Selenium in micrograms (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.vitamin_a_mcg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.vitamin_a_mcg IS 'Vitamin A in micrograms RAE (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.vitamin_b6_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.vitamin_b6_mg IS 'Vitamin B6 in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.vitamin_b12_mcg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.vitamin_b12_mcg IS 'Vitamin B12 in micrograms (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.vitamin_c_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.vitamin_c_mg IS 'Vitamin C in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.vitamin_e_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.vitamin_e_mg IS 'Vitamin E in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.vitamin_k_mcg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.vitamin_k_mcg IS 'Vitamin K in micrograms (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.folate_mcg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.folate_mcg IS 'Folate in micrograms DFE (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.niacin_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.niacin_mg IS 'Niacin (B3) in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.riboflavin_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.riboflavin_mg IS 'Riboflavin (B2) in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.thiamin_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.thiamin_mg IS 'Thiamin (B1) in milligrams (from food_servings * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.food_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.food_id IS 'Reference to foods table (bigint USDA FDC ID). Replaces food_serving_id.';


--
-- Name: COLUMN nutrition_logs.vitamin_d_mcg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.vitamin_d_mcg IS 'Vitamin D in micrograms (from food * quantity_consumed)';


--
-- Name: COLUMN nutrition_logs.cholesterol_mg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nutrition_logs.cholesterol_mg IS 'Cholesterol in milligrams (from food * quantity_consumed)';


--
-- Name: daily_nutrition_totals; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.daily_nutrition_totals WITH (security_invoker='true') AS
 SELECT user_id,
    log_date,
    (COALESCE(sum(calories), (0)::numeric))::numeric(10,2) AS total_calories,
    (COALESCE(sum(protein_g), (0)::numeric))::numeric(10,2) AS total_protein_g,
    (COALESCE(sum(carbs_g), (0)::numeric))::numeric(10,2) AS total_carbs_g,
    (COALESCE(sum(fat_g), (0)::numeric))::numeric(10,2) AS total_fat_g,
    (COALESCE(sum(fiber_g), (0)::numeric))::numeric(10,2) AS total_fiber_g,
    (COALESCE(sum(sugar_g), (0)::numeric))::numeric(10,2) AS total_sugar_g,
    (COALESCE(sum(sodium_mg), (0)::numeric))::numeric(10,2) AS total_sodium_mg,
    (COALESCE(sum(potassium_mg), (0)::numeric))::numeric(10,2) AS total_potassium_mg,
    (COALESCE(sum(calcium_mg), (0)::numeric))::numeric(10,2) AS total_calcium_mg,
    (COALESCE(sum(iron_mg), (0)::numeric))::numeric(10,2) AS total_iron_mg,
    (COALESCE(sum(magnesium_mg), (0)::numeric))::numeric(10,2) AS total_magnesium_mg,
    (COALESCE(sum(phosphorus_mg), (0)::numeric))::numeric(10,2) AS total_phosphorus_mg,
    (COALESCE(sum(zinc_mg), (0)::numeric))::numeric(10,2) AS total_zinc_mg,
    (COALESCE(sum(copper_mg), (0)::numeric))::numeric(10,2) AS total_copper_mg,
    (COALESCE(sum(selenium_mcg), (0)::numeric))::numeric(10,2) AS total_selenium_mcg,
    (COALESCE(sum(cholesterol_mg), (0)::numeric))::numeric(10,2) AS total_cholesterol_mg,
    (COALESCE(sum(vitamin_a_mcg), (0)::numeric))::numeric(10,2) AS total_vitamin_a_mcg,
    (COALESCE(sum(vitamin_c_mg), (0)::numeric))::numeric(10,2) AS total_vitamin_c_mg,
    (COALESCE(sum(vitamin_e_mg), (0)::numeric))::numeric(10,2) AS total_vitamin_e_mg,
    (COALESCE(sum(vitamin_d_mcg), (0)::numeric))::numeric(10,2) AS total_vitamin_d_mcg,
    (COALESCE(sum(vitamin_k_mcg), (0)::numeric))::numeric(10,2) AS total_vitamin_k_mcg,
    (COALESCE(sum(thiamin_mg), (0)::numeric))::numeric(10,2) AS total_thiamin_mg,
    (COALESCE(sum(riboflavin_mg), (0)::numeric))::numeric(10,2) AS total_riboflavin_mg,
    (COALESCE(sum(niacin_mg), (0)::numeric))::numeric(10,2) AS total_niacin_mg,
    (COALESCE(sum(vitamin_b6_mg), (0)::numeric))::numeric(10,2) AS total_vitamin_b6_mg,
    (COALESCE(sum(folate_mcg), (0)::numeric))::numeric(10,2) AS total_folate_mcg,
    (COALESCE(sum(vitamin_b12_mcg), (0)::numeric))::numeric(10,2) AS total_vitamin_b12_mcg,
    (COALESCE(sum(water_oz_consumed), (0)::numeric))::numeric(10,2) AS total_water_oz,
    count(*) AS entry_count,
    count(DISTINCT food_id) AS unique_foods_count,
    max(created_at) AS last_entry_time,
    min(created_at) AS first_entry_time
   FROM public.nutrition_logs nl
  GROUP BY user_id, log_date;


--
-- Name: direct_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.direct_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid,
    recipient_id uuid,
    content text NOT NULL,
    message_type character varying(20) DEFAULT 'text'::character varying,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    needs_response boolean DEFAULT true,
    CONSTRAINT direct_messages_message_type_check CHECK (((message_type)::text = ANY (ARRAY[('text'::character varying)::text, ('image'::character varying)::text, ('file'::character varying)::text, ('system'::character varying)::text])))
);


--
-- Name: email_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_campaigns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    recipients_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: email_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    user_email text,
    campaign_id uuid,
    clicked_url text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: exercises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercises (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    instructions text,
    equipment_needed text,
    exercise_type text,
    thumbnail_url text,
    video_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    primary_muscle text,
    secondary_muscle text,
    tertiary_muscle text,
    difficulty_level text,
    CONSTRAINT exercises_exercise_type_check CHECK ((exercise_type = ANY (ARRAY['Free Weight'::text, 'Machine'::text, 'Bodyweight'::text, 'Cable'::text])))
);


--
-- Name: foods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.foods (
    id bigint NOT NULL,
    name text NOT NULL,
    category text,
    brand_owner text,
    data_source text DEFAULT 'USDA'::text,
    calories numeric DEFAULT 0,
    protein_g numeric DEFAULT 0,
    fat_g numeric DEFAULT 0,
    carbs_g numeric DEFAULT 0,
    sugar_g numeric DEFAULT 0,
    fiber_g numeric DEFAULT 0,
    sodium_mg numeric DEFAULT 0,
    potassium_mg numeric DEFAULT 0,
    calcium_mg numeric DEFAULT 0,
    iron_mg numeric DEFAULT 0,
    magnesium_mg numeric DEFAULT 0,
    phosphorus_mg numeric DEFAULT 0,
    zinc_mg numeric DEFAULT 0,
    copper_mg numeric DEFAULT 0,
    selenium_mcg numeric DEFAULT 0,
    cholesterol_mg numeric DEFAULT 0,
    vitamin_a_mcg numeric DEFAULT 0,
    vitamin_c_mg numeric DEFAULT 0,
    vitamin_e_mg numeric DEFAULT 0,
    vitamin_d_mcg numeric DEFAULT 0,
    vitamin_k_mcg numeric DEFAULT 0,
    thiamin_mg numeric DEFAULT 0,
    riboflavin_mg numeric DEFAULT 0,
    niacin_mg numeric DEFAULT 0,
    vitamin_b6_mg numeric DEFAULT 0,
    folate_mcg numeric DEFAULT 0,
    vitamin_b12_mcg numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    name_simplified text,
    search_tokens text,
    commonness_score integer DEFAULT 50,
    times_logged integer DEFAULT 0,
    last_logged_at timestamp with time zone,
    user_boost_score integer DEFAULT 0,
    weight_g text DEFAULT '0'::text
);


--
-- Name: COLUMN foods.times_logged; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.foods.times_logged IS 'Total number of times this food has been logged across all users';


--
-- Name: COLUMN foods.last_logged_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.foods.last_logged_at IS 'Most recent timestamp this food was logged by any user';


--
-- Name: COLUMN foods.user_boost_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.foods.user_boost_score IS 'Boost score (0-25) based on user logging frequency, auto-calculated weekly';


--
-- Name: foods_with_effective_score; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.foods_with_effective_score AS
 SELECT id,
    name,
    category,
    brand_owner,
    data_source,
    calories,
    protein_g,
    fat_g,
    carbs_g,
    sugar_g,
    fiber_g,
    sodium_mg,
    potassium_mg,
    calcium_mg,
    iron_mg,
    magnesium_mg,
    phosphorus_mg,
    zinc_mg,
    copper_mg,
    selenium_mcg,
    cholesterol_mg,
    vitamin_a_mcg,
    vitamin_c_mg,
    vitamin_e_mg,
    vitamin_d_mcg,
    vitamin_k_mcg,
    thiamin_mg,
    riboflavin_mg,
    niacin_mg,
    vitamin_b6_mg,
    folate_mcg,
    vitamin_b12_mcg,
    created_at,
    name_simplified,
    search_tokens,
    commonness_score,
    times_logged,
    last_logged_at,
    user_boost_score,
    LEAST(100, (commonness_score + user_boost_score)) AS effective_score
   FROM public.foods;


--
-- Name: VIEW foods_with_effective_score; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.foods_with_effective_score IS 'Foods with combined commonness + user preference boost (capped at 100)';


--
-- Name: goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    target_value numeric(10,2),
    current_value numeric(10,2),
    target_date date,
    status character varying(20) DEFAULT 'active'::character varying,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    goal_description text,
    "isWeightGoal" boolean,
    CONSTRAINT goals_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('paused'::character varying)::text, ('completed'::character varying)::text, ('cancelled'::character varying)::text])))
);


--
-- Name: meal_foods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_foods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    meal_id uuid,
    quantity numeric(8,2) DEFAULT 1 NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    food_id bigint
);

ALTER TABLE ONLY public.meal_foods FORCE ROW LEVEL SECURITY;


--
-- Name: meals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name text NOT NULL,
    description text,
    category character varying(100),
    prep_time_minutes integer,
    cook_time_minutes integer,
    serving_size integer,
    difficulty_level integer,
    instructions text,
    image_url text,
    is_favorite boolean DEFAULT false,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_premade boolean DEFAULT false,
    tags text[] DEFAULT '{}'::text[],
    CONSTRAINT meals_difficulty_level_check CHECK (((difficulty_level >= 1) AND (difficulty_level <= 5)))
);


--
-- Name: mesocycle_weeks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mesocycle_weeks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mesocycle_id uuid,
    week_index bigint,
    deload boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    session_order bigint DEFAULT '0'::bigint,
    notes text,
    routine_id uuid,
    day_index integer,
    is_complete boolean DEFAULT false,
    completed_at timestamp with time zone,
    day_type text,
    skipped boolean DEFAULT false,
    routine_name text
);


--
-- Name: COLUMN mesocycle_weeks.is_complete; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mesocycle_weeks.is_complete IS 'Tracks whether this specific routine instance in the mesocycle has been completed. Set to true when workout is saved or when user clicks Skip button.';


--
-- Name: COLUMN mesocycle_weeks.completed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mesocycle_weeks.completed_at IS 'Timestamp when this routine was marked as complete (either by completing the workout or skipping it).';


--
-- Name: COLUMN mesocycle_weeks.day_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.mesocycle_weeks.day_type IS 'Type of day: routine, rest, deload, etc.';


--
-- Name: mesocycles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mesocycles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name character varying(255) NOT NULL,
    description text,
    focus character varying(100),
    weeks integer,
    start_date date,
    end_date date,
    status text,
    is_active boolean DEFAULT false,
    is_complete boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: muscle_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.muscle_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    primary_muscle text
);


--
-- Name: nutrition_enrichment_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutrition_enrichment_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    priority integer DEFAULT 5,
    enrichment_type text DEFAULT 'full'::text,
    error_message text,
    retry_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    quality_score_before numeric(5,2),
    quality_score_after numeric(5,2),
    changes_made jsonb,
    CONSTRAINT nutrition_enrichment_queue_enrichment_type_check CHECK ((enrichment_type = ANY (ARRAY['basic'::text, 'full'::text, 'nutrition-only'::text]))),
    CONSTRAINT nutrition_enrichment_queue_priority_check CHECK (((priority >= 1) AND (priority <= 10))),
    CONSTRAINT nutrition_enrichment_queue_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text]))),
    CONSTRAINT valid_priority CHECK (((priority >= 1) AND (priority <= 10)))
);


--
-- Name: nutrition_pipeline_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutrition_pipeline_status (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    total_foods integer DEFAULT 0,
    total_verified integer DEFAULT 0,
    total_pending integer DEFAULT 0,
    total_enriched integer DEFAULT 0,
    average_quality_score numeric(5,2) DEFAULT 0,
    foods_below_threshold integer DEFAULT 0,
    queue_size integer DEFAULT 0,
    processing_count integer DEFAULT 0,
    completed_today integer DEFAULT 0,
    failed_today integer DEFAULT 0,
    last_updated timestamp with time zone DEFAULT now(),
    last_enrichment_run timestamp with time zone,
    CONSTRAINT valid_quality_score CHECK (((average_quality_score >= (0)::numeric) AND (average_quality_score <= (100)::numeric)))
);


--
-- Name: plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plans (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    plan_name text
);


--
-- Name: plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.plans ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: portions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_id bigint,
    amount numeric NOT NULL,
    measure_unit text NOT NULL,
    gram_weight numeric NOT NULL,
    portion_description text
);


--
-- Name: pro_routine_exercises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pro_routine_exercises (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    routine_id uuid NOT NULL,
    exercise_id uuid NOT NULL,
    target_sets integer DEFAULT 1 NOT NULL,
    sets integer,
    reps character varying(20),
    weight_kg numeric(6,2),
    rest_seconds integer,
    notes text,
    exercise_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_warmup boolean,
    target_reps text,
    target_intensity_pct integer DEFAULT 75,
    CONSTRAINT pro_routine_exercises_target_intensity_pct_check CHECK (((target_intensity_pct >= 0) AND (target_intensity_pct <= 100)))
);


--
-- Name: TABLE pro_routine_exercises; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.pro_routine_exercises IS 'Links professional routines to their exercises with workout parameters';


--
-- Name: COLUMN pro_routine_exercises.is_warmup; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pro_routine_exercises.is_warmup IS 'Indicates if this exercise is a warmup set (true) or working set (false)';


--
-- Name: COLUMN pro_routine_exercises.target_intensity_pct; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pro_routine_exercises.target_intensity_pct IS 'Target intensity as percentage of 1RM (0-100). Typical ranges: Warmup 40-60%, Working 70-85%, Peak 90-100%';


--
-- Name: pro_routines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pro_routines (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    routine_name text,
    name text,
    description text,
    estimated_duration_minutes integer,
    difficulty_level text,
    routine_type text,
    is_active boolean,
    is_public boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    category text,
    CONSTRAINT pro_routines_category_check CHECK ((category = ANY (ARRAY['Strength'::text, 'Hypertrophy'::text, 'Endurance'::text, 'Challenges'::text, 'Bodyweight'::text, 'Interval'::text]))),
    CONSTRAINT pro_routines_difficulty_level_check CHECK ((difficulty_level = ANY (ARRAY['Beginner'::text, 'Intermediate'::text, 'Advanced'::text])))
);


--
-- Name: programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.programs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true,
    difficulty_level text DEFAULT 'intermediate'::text,
    exercise_pool jsonb DEFAULT '[]'::jsonb,
    program_type text,
    estimated_weeks integer DEFAULT 12,
    target_muscle_groups text[] DEFAULT '{}'::text[],
    is_template boolean DEFAULT false,
    trainer_id uuid,
    created_by uuid,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT programs_difficulty_level_check CHECK ((difficulty_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))),
    CONSTRAINT programs_program_type_check CHECK ((program_type = ANY (ARRAY['strength'::text, 'hypertrophy'::text, 'endurance'::text, 'flexibility'::text, 'recovery'::text])))
);


--
-- Name: COLUMN programs.estimated_weeks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.programs.estimated_weeks IS 'Program duration in weeks - used to calculate recurrence end date in SmartScheduling';


--
-- Name: routine_exercises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.routine_exercises (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    routine_id uuid,
    exercise_id uuid,
    target_sets integer DEFAULT 1 NOT NULL,
    sets integer,
    reps character varying(20),
    weight_kg numeric(6,2),
    rest_seconds integer,
    notes text,
    exercise_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    is_warmup boolean,
    target_reps text,
    target_intensity_pct integer DEFAULT 75,
    negative boolean,
    drop_set boolean,
    superset_id uuid,
    drop_set_percentage numeric,
    exercise_name text,
    exercise_thumbnail_url text,
    CONSTRAINT routine_exercises_target_intensity_pct_check CHECK (((target_intensity_pct >= 0) AND (target_intensity_pct <= 100)))
);


--
-- Name: COLUMN routine_exercises.is_warmup; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.routine_exercises.is_warmup IS 'Indicates if this exercise is a warmup set (true) or working set (false)';


--
-- Name: COLUMN routine_exercises.target_intensity_pct; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.routine_exercises.target_intensity_pct IS 'Target intensity as percentage of 1RM (0-100). Typical ranges: Warmup 40-60%, Working 70-85%, Peak 90-100%';


--
-- Name: scheduled_routines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scheduled_routines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    routine_id uuid NOT NULL,
    scheduled_date date NOT NULL,
    is_completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    scheduled_time time without time zone DEFAULT '08:00:00'::time without time zone,
    duration_minutes integer DEFAULT 60,
    google_event_id text,
    client_email text,
    recurrence_rule text,
    recurrence_end_date date,
    is_recurring boolean DEFAULT false,
    client_name text
);


--
-- Name: TABLE scheduled_routines; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.scheduled_routines IS 'Weekly workout schedules created by trainers for clients';


--
-- Name: COLUMN scheduled_routines.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.user_id IS 'Client who will perform this workout';


--
-- Name: COLUMN scheduled_routines.routine_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.routine_id IS 'Workout routine to be performed';


--
-- Name: COLUMN scheduled_routines.scheduled_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.scheduled_date IS 'Date this routine is scheduled for';


--
-- Name: COLUMN scheduled_routines.is_completed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.is_completed IS 'Whether client has completed this session';


--
-- Name: COLUMN scheduled_routines.completed_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.completed_at IS 'Timestamp when session was marked complete';


--
-- Name: COLUMN scheduled_routines.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.notes IS 'Optional notes from trainer or client';


--
-- Name: COLUMN scheduled_routines.scheduled_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.scheduled_time IS 'Time of day for the workout (default 8:00 AM)';


--
-- Name: COLUMN scheduled_routines.duration_minutes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.duration_minutes IS 'Expected duration in minutes (default 60)';


--
-- Name: COLUMN scheduled_routines.google_event_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.google_event_id IS 'Google Calendar event ID for syncing';


--
-- Name: COLUMN scheduled_routines.client_email; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.client_email IS 'Client email, synced from trainer_clients for notifications';


--
-- Name: COLUMN scheduled_routines.recurrence_rule; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.recurrence_rule IS 'iCalendar RRULE format for recurring events';


--
-- Name: COLUMN scheduled_routines.recurrence_end_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.recurrence_end_date IS 'End date for recurring series';


--
-- Name: COLUMN scheduled_routines.is_recurring; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.is_recurring IS 'Whether this is a recurring event';


--
-- Name: COLUMN scheduled_routines.client_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.scheduled_routines.client_name IS 'Client full name, synced from trainer_clients for quick display';


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    color character varying(7),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: trainer_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trainer_clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trainer_id uuid,
    client_id uuid,
    status character varying(20) DEFAULT 'active'::character varying,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    full_name text,
    assigned_program_id uuid,
    generated_routine_ids uuid[] DEFAULT ARRAY[]::uuid[],
    email text,
    program_name text,
    tags text[] DEFAULT '{}'::text[],
    is_unsubscribed boolean DEFAULT false,
    start_date date,
    first_name text,
    last_name text,
    phone text,
    date_of_birth date,
    gender text,
    address text,
    city text,
    state text,
    zip_code text,
    emergency_name text,
    emergency_phone text,
    emergency_relationship text,
    height numeric,
    weight numeric,
    body_fat_percentage numeric,
    resting_heart_rate integer,
    blood_pressure text,
    medical_conditions text,
    medications text,
    injuries text,
    allergies text,
    doctor_clearance boolean DEFAULT false,
    primary_goal text,
    secondary_goals text[],
    target_weight numeric,
    timeframe text,
    workout_days text[],
    preferred_time text,
    session_length text,
    exercise_preferences text[],
    exercise_restrictions text,
    program_type text,
    nutrition_coaching boolean DEFAULT false,
    activity_level text,
    age integer DEFAULT 0,
    calculated_max_hr integer DEFAULT 0,
    calculated_protein_g integer DEFAULT 50,
    calculated_fat_g integer DEFAULT 5,
    calculated_carbs_g integer DEFAULT 100,
    lean_body_mass_lbs integer DEFAULT 0,
    tdee bigint DEFAULT '0'::bigint,
    additional_programs text DEFAULT 'Null'::text,
    CONSTRAINT trainer_clients_additional_programs_check CHECK (((additional_programs IS NULL) OR (additional_programs = ANY (ARRAY['personal-training'::text, 'small-group-training'::text, 'online-coaching'::text, 'hybrid-in-person-and-online'::text, 'None'::text])))),
    CONSTRAINT trainer_clients_status_check CHECK (((status)::text = ANY (ARRAY[('active'::character varying)::text, ('inactive'::character varying)::text, ('pending'::character varying)::text, ('blocked'::character varying)::text])))
);


--
-- Name: COLUMN trainer_clients.assigned_program_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.trainer_clients.assigned_program_id IS 'Reference to the program template that was assigned to this client';


--
-- Name: COLUMN trainer_clients.generated_routine_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.trainer_clients.generated_routine_ids IS 'Array of workout_routines IDs that were generated from the assigned program for this client';


--
-- Name: COLUMN trainer_clients.email; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.trainer_clients.email IS 'Client email address, synced from user_profiles for quick access';


--
-- Name: COLUMN trainer_clients.program_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.trainer_clients.program_name IS 'Human-readable program name for easy identification (e.g., "Strength Builder", "Fat Loss Program")';


--
-- Name: COLUMN trainer_clients.tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.trainer_clients.tags IS 'Array of trainer_group_tags UUIDs. Use for querying clients by tag: WHERE tag_id = ANY(tags)';


--
-- Name: COLUMN trainer_clients.is_unsubscribed; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.trainer_clients.is_unsubscribed IS 'Whether client has unsubscribed from trainer marketing emails. Does not affect transactional emails.';


--
-- Name: trainer_email_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trainer_email_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trainer_id uuid NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE trainer_email_templates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.trainer_email_templates IS 'Reusable email templates created by trainers for marketing campaigns';


--
-- Name: COLUMN trainer_email_templates.body; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.trainer_email_templates.body IS 'HTML content from TinyMCE editor, supports rich formatting';


--
-- Name: trainer_group_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trainer_group_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trainer_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE trainer_group_tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.trainer_group_tags IS 'Trainer-specific group tags for organizing clients (e.g., "Monday Bootcamp", "Nutrition Challenge")';


--
-- Name: COLUMN trainer_group_tags.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.trainer_group_tags.name IS 'Human-readable tag name displayed on orange buttons in UI';


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    achievement_id uuid NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now(),
    seen boolean DEFAULT false
);


--
-- Name: user_meal_foods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_meal_foods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_meal_id uuid NOT NULL,
    quantity numeric DEFAULT 1 NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    food_id bigint
);


--
-- Name: user_meals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_meals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    is_favorite boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    custom_name character varying(255),
    name text DEFAULT 'Untitled Meal'::text NOT NULL,
    description text,
    instructions text,
    tags text[] DEFAULT '{}'::text[],
    category text,
    prep_time_minutes integer,
    cook_time_minutes integer,
    serving_size numeric,
    difficulty_level integer,
    image_url text,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: COLUMN user_meals.custom_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_meals.custom_name IS 'User-defined custom name for saved meals';


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    user_id uuid,
    email text,
    first_name text,
    last_name text,
    date_of_birth date,
    sex text,
    height_cm integer,
    current_weight_lbs numeric(5,2),
    target_weight_lbs numeric(5,2),
    activity_level text,
    fitness_goal text,
    diet_preference character varying(50),
    daily_calorie_goal integer,
    daily_protein_goal_g numeric(6,2),
    daily_protein_goal numeric(6,2),
    daily_carb_goal_g numeric(6,2),
    daily_carb_goal numeric(6,2),
    daily_fat_goal_g numeric(6,2),
    daily_fat_goal numeric(6,2),
    daily_water_goal_oz integer,
    daily_water_goal integer,
    theme character varying(20) DEFAULT 'dark'::character varying,
    timezone character varying(50) DEFAULT 'UTC'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_client boolean,
    is_trainer boolean,
    is_admin boolean,
    plan_type bigint,
    phone text,
    address text,
    city text,
    state text,
    zip_code text,
    weight_lbs numeric(6,2),
    is_beta boolean,
    use_rpe boolean DEFAULT true,
    use_rest_timer boolean DEFAULT true,
    height_feet integer GENERATED ALWAYS AS (
CASE
    WHEN (height_cm IS NOT NULL) THEN (floor((((height_cm)::numeric / 2.54) / (12)::numeric)))::integer
    ELSE NULL::integer
END) STORED,
    height_inches integer GENERATED ALWAYS AS (
CASE
    WHEN (height_cm IS NOT NULL) THEN (floor((((height_cm)::numeric / 2.54) % (12)::numeric)))::integer
    ELSE NULL::integer
END) STORED,
    weight_kg numeric(6,2) GENERATED ALWAYS AS (
CASE
    WHEN (weight_lbs IS NOT NULL) THEN round((weight_lbs * 0.453592), 2)
    ELSE NULL::numeric
END) STORED,
    current_weight_kg numeric(6,2) GENERATED ALWAYS AS (
CASE
    WHEN (current_weight_lbs IS NOT NULL) THEN round((current_weight_lbs * 0.453592), 2)
    ELSE NULL::numeric
END) STORED,
    target_weight_kg numeric(6,2) GENERATED ALWAYS AS (
CASE
    WHEN (target_weight_lbs IS NOT NULL) THEN round((target_weight_lbs * 0.453592), 2)
    ELSE NULL::numeric
END) STORED,
    CONSTRAINT user_profiles_activity_level_check CHECK ((activity_level = ANY (ARRAY[('sedentary'::character varying)::text, ('lightly_active'::character varying)::text, ('moderately_active'::character varying)::text, ('very_active'::character varying)::text, ('extra_active'::character varying)::text]))),
    CONSTRAINT user_profiles_fitness_goal_check CHECK ((fitness_goal = ANY (ARRAY[('lose_weight'::character varying)::text, ('maintain_weight'::character varying)::text, ('gain_weight'::character varying)::text, ('build_muscle'::character varying)::text, ('improve_endurance'::character varying)::text]))),
    CONSTRAINT user_profiles_sex_check CHECK ((sex = ANY (ARRAY[('male'::character varying)::text, ('female'::character varying)::text, ('other'::character varying)::text]))),
    CONSTRAINT user_profiles_weight_lbs_check CHECK (((weight_lbs IS NULL) OR (weight_lbs > (0)::numeric)))
);


--
-- Name: COLUMN user_profiles.target_weight_lbs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.target_weight_lbs IS 'Target weight in pounds (must be positive if set)';


--
-- Name: COLUMN user_profiles.plan_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.plan_type IS 'References plans.id - users subscription plan';


--
-- Name: COLUMN user_profiles.phone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.phone IS 'User phone number';


--
-- Name: COLUMN user_profiles.address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.address IS 'Street address';


--
-- Name: COLUMN user_profiles.city; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.city IS 'City';


--
-- Name: COLUMN user_profiles.state; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.state IS 'State/Province';


--
-- Name: COLUMN user_profiles.zip_code; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.zip_code IS 'ZIP/Postal code';


--
-- Name: COLUMN user_profiles.weight_lbs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.weight_lbs IS 'Current weight in pounds (must be positive if set)';


--
-- Name: COLUMN user_profiles.is_beta; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.is_beta IS 'Indicates if user is part of the beta testing group';


--
-- Name: COLUMN user_profiles.height_feet; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.height_feet IS 'Computed from height_cm: feet component of imperial height';


--
-- Name: COLUMN user_profiles.height_inches; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.height_inches IS 'Computed from height_cm: inches component of imperial height (0-11)';


--
-- Name: COLUMN user_profiles.weight_kg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.weight_kg IS 'Computed from weight_lbs: weight in kilograms';


--
-- Name: COLUMN user_profiles.current_weight_kg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.current_weight_kg IS 'Computed from current_weight_lbs: current weight in kilograms';


--
-- Name: COLUMN user_profiles.target_weight_kg; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.user_profiles.target_weight_kg IS 'Computed from target_weight_lbs: target weight in kilograms';


--
-- Name: user_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_stats (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    total_workouts integer DEFAULT 0,
    current_workout_streak integer DEFAULT 0,
    longest_workout_streak integer DEFAULT 0,
    last_workout_date date,
    total_sets integer DEFAULT 0,
    total_reps integer DEFAULT 0,
    total_volume_lbs bigint DEFAULT 0,
    mesocycles_completed integer DEFAULT 0,
    total_prs integer DEFAULT 0,
    prs_by_exercise jsonb DEFAULT '{}'::jsonb,
    nutrition_logs_count integer DEFAULT 0,
    current_nutrition_streak integer DEFAULT 0,
    longest_nutrition_streak integer DEFAULT 0,
    last_nutrition_log_date date,
    perfect_macro_days integer DEFAULT 0,
    water_logs_count integer DEFAULT 0,
    current_hydration_streak integer DEFAULT 0,
    longest_hydration_streak integer DEFAULT 0,
    total_xp integer DEFAULT 0,
    current_level integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    tag_id uuid,
    assigned_by uuid,
    assigned_at timestamp with time zone DEFAULT now()
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text,
    full_name text,
    phone_number text,
    address text,
    is_unsubscribed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: weekly_meal_plan_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_meal_plan_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_id uuid NOT NULL,
    meal_id uuid,
    plan_date date NOT NULL,
    meal_type character varying(50) NOT NULL,
    servings numeric(5,2) DEFAULT 1.0,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    user_meal_id uuid,
    CONSTRAINT weekly_meal_plan_entries_meal_type_check CHECK (((meal_type)::text = ANY (ARRAY[('breakfast'::character varying)::text, ('lunch'::character varying)::text, ('dinner'::character varying)::text, ('snack1'::character varying)::text, ('snack2'::character varying)::text]))),
    CONSTRAINT weekly_meal_plan_entries_meal_xor CHECK ((((meal_id IS NOT NULL) AND (user_meal_id IS NULL)) OR ((meal_id IS NULL) AND (user_meal_id IS NOT NULL))))
);


--
-- Name: TABLE weekly_meal_plan_entries; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.weekly_meal_plan_entries IS 'Individual meal assignments within weekly plans (date + meal type)';


--
-- Name: COLUMN weekly_meal_plan_entries.meal_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weekly_meal_plan_entries.meal_type IS 'Type of meal: breakfast, lunch, dinner, snack1, snack2';


--
-- Name: COLUMN weekly_meal_plan_entries.servings; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weekly_meal_plan_entries.servings IS 'Number of servings for nutrition calculation';


--
-- Name: weekly_meal_plan_nutrition; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.weekly_meal_plan_nutrition AS
 SELECT e.plan_id,
    e.plan_date,
    round(COALESCE(sum(((f.calories * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_calories,
    round(COALESCE(sum(((f.protein_g * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_protein_g,
    round(COALESCE(sum(((f.carbs_g * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_carbs_g,
    round(COALESCE(sum(((f.fat_g * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_fat_g,
    round(COALESCE(sum(((f.sugar_g * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_sugar_g,
    round(COALESCE(sum(((f.fiber_g * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_fiber_g,
    round(COALESCE(sum(((f.cholesterol_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_cholesterol_mg,
    round(COALESCE(sum(((f.sodium_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_sodium_mg,
    round(COALESCE(sum(((f.potassium_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_potassium_mg,
    round(COALESCE(sum(((f.calcium_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_calcium_mg,
    round(COALESCE(sum(((f.iron_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_iron_mg,
    round(COALESCE(sum(((f.magnesium_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_magnesium_mg,
    round(COALESCE(sum(((f.phosphorus_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_phosphorus_mg,
    round(COALESCE(sum(((f.zinc_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_zinc_mg,
    round(COALESCE(sum(((f.copper_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_copper_mg,
    round(COALESCE(sum(((f.selenium_mcg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_selenium_mcg,
    round(COALESCE(sum(((f.vitamin_a_mcg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_vitamin_a_mcg,
    round(COALESCE(sum(((f.vitamin_c_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_vitamin_c_mg,
    round(COALESCE(sum(((f.vitamin_e_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_vitamin_e_mg,
    round(COALESCE(sum(((f.vitamin_d_mcg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_vitamin_d_mcg,
    round(COALESCE(sum(((f.vitamin_k_mcg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_vitamin_k_mcg,
    round(COALESCE(sum(((f.thiamin_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_thiamin_mg,
    round(COALESCE(sum(((f.riboflavin_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_riboflavin_mg,
    round(COALESCE(sum(((f.niacin_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_niacin_mg,
    round(COALESCE(sum(((f.vitamin_b6_mg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_vitamin_b6_mg,
    round(COALESCE(sum(((f.folate_mcg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_folate_mcg,
    round(COALESCE(sum(((f.vitamin_b12_mcg * umf.quantity) * COALESCE(e.servings, (1)::numeric))), (0)::numeric), 1) AS total_vitamin_b12_mcg,
    count(DISTINCT e.id) AS meal_entry_count,
    count(DISTINCT umf.food_id) AS unique_food_count
   FROM (((public.weekly_meal_plan_entries e
     JOIN public.user_meals um ON ((e.user_meal_id = um.id)))
     JOIN public.user_meal_foods umf ON ((um.id = umf.user_meal_id)))
     JOIN public.foods f ON ((umf.food_id = f.id)))
  WHERE (e.user_meal_id IS NOT NULL)
  GROUP BY e.plan_id, e.plan_date
  WITH NO DATA;


--
-- Name: MATERIALIZED VIEW weekly_meal_plan_nutrition; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON MATERIALIZED VIEW public.weekly_meal_plan_nutrition IS 'Pre-calculated nutrition totals for weekly meal plans. Aggregates all 28+ nutrients by plan_id and plan_date. Refreshed automatically via trigger. Provides 67% performance improvement (1.2s → 400ms).';


--
-- Name: weekly_meal_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_meal_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE weekly_meal_plans; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.weekly_meal_plans IS 'Stores weekly meal plans with date ranges and active status';


--
-- Name: COLUMN weekly_meal_plans.is_active; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.weekly_meal_plans.is_active IS 'Only one plan should be active per user at a time';


--
-- Name: weekly_nutrition_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.weekly_nutrition_summary WITH (security_invoker='true') AS
 SELECT user_id,
    log_date,
    sum(total_calories) OVER w7 AS week_calories,
    sum(total_protein_g) OVER w7 AS week_protein_g,
    sum(total_carbs_g) OVER w7 AS week_carbs_g,
    sum(total_fat_g) OVER w7 AS week_fat_g,
    sum(total_fiber_g) OVER w7 AS week_fiber_g,
    sum(total_sugar_g) OVER w7 AS week_sugar_g,
    avg(total_calories) OVER w7 AS avg_daily_calories,
    avg(total_protein_g) OVER w7 AS avg_daily_protein_g,
    avg(total_carbs_g) OVER w7 AS avg_daily_carbs_g,
    avg(total_fat_g) OVER w7 AS avg_daily_fat_g,
    count(*) OVER w7 AS days_logged_in_week,
    total_calories AS today_calories,
    total_protein_g AS today_protein_g,
    total_carbs_g AS today_carbs_g,
    total_fat_g AS today_fat_g,
    entry_count AS today_entry_count
   FROM public.daily_nutrition_totals
  WINDOW w7 AS (PARTITION BY user_id ORDER BY log_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW);


--
-- Name: workout_log_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workout_log_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workout_log_id uuid,
    log_id uuid,
    exercise_id uuid,
    set_number integer NOT NULL,
    reps_completed integer,
    reps integer,
    weight_lifted_kg numeric(6,2),
    weight_lbs numeric(6,2),
    duration_seconds integer,
    distance_meters numeric(8,2),
    rpe_rating integer,
    notes text,
    completed boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    volume_lbs numeric(10,2) GENERATED ALWAYS AS (
CASE
    WHEN ((weight_lbs IS NOT NULL) AND (reps_completed IS NOT NULL)) THEN (weight_lbs * (reps_completed)::numeric)
    ELSE (0)::numeric
END) STORED,
    CONSTRAINT workout_log_entries_rpe_rating_check CHECK (((rpe_rating >= 1) AND (rpe_rating <= 10)))
);


--
-- Name: workout_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workout_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    routine_id uuid,
    workout_name character varying(255),
    log_date date DEFAULT CURRENT_DATE NOT NULL,
    started_at timestamp with time zone,
    ended_at timestamp with time zone,
    duration_minutes integer,
    total_volume_kg numeric(10,2),
    total_reps integer,
    calories_burned integer,
    is_complete boolean DEFAULT false,
    notes text,
    mood_rating integer,
    created_at timestamp with time zone DEFAULT now(),
    cycle_session_id uuid,
    CONSTRAINT workout_logs_mood_rating_check CHECK (((mood_rating >= 1) AND (mood_rating <= 5)))
);


--
-- Name: COLUMN workout_logs.cycle_session_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.workout_logs.cycle_session_id IS 'Links this workout log to a specific mesocycle training session for periodization tracking';


--
-- Name: workout_exercise_session_stats; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.workout_exercise_session_stats WITH (security_invoker='true') AS
 SELECT wle.workout_log_id,
    wle.exercise_id,
    wl.user_id,
    wl.log_date,
    count(*) AS sets_completed,
    sum(wle.volume_lbs) AS total_volume_lbs,
    avg(wle.volume_lbs) FILTER (WHERE (wle.volume_lbs > (0)::numeric)) AS avg_volume_per_set,
    max(wle.volume_lbs) AS max_volume_single_set,
    max(wle.weight_lbs) AS max_weight_lbs,
    avg(wle.weight_lbs) FILTER (WHERE (wle.weight_lbs > (0)::numeric)) AS avg_weight_lbs,
    min(wle.weight_lbs) FILTER (WHERE (wle.weight_lbs > (0)::numeric)) AS min_weight_lbs,
    sum(wle.reps_completed) AS total_reps,
    avg(wle.reps_completed) AS avg_reps,
    max(wle.reps_completed) AS max_reps,
    min(wle.reps_completed) AS min_reps,
    avg(wle.rpe_rating) FILTER (WHERE (wle.rpe_rating IS NOT NULL)) AS avg_rpe,
    array_agg(jsonb_build_object('set_number', wle.set_number, 'reps', wle.reps_completed, 'weight', wle.weight_lbs, 'volume', wle.volume_lbs, 'rpe', wle.rpe_rating) ORDER BY wle.set_number) AS set_details
   FROM (public.workout_log_entries wle
     JOIN public.workout_logs wl ON ((wle.workout_log_id = wl.id)))
  WHERE (wle.completed = true)
  GROUP BY wle.workout_log_id, wle.exercise_id, wl.user_id, wl.log_date;


--
-- Name: VIEW workout_exercise_session_stats; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.workout_exercise_session_stats IS 'Exercise-specific statistics within each workout session. Used for progress tracking and charts.';


--
-- Name: workout_routines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workout_routines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    routine_name character varying(255) NOT NULL,
    name character varying(255),
    description text,
    estimated_duration_minutes integer,
    routine_type character varying(50),
    is_active boolean DEFAULT true,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    difficulty_level text,
    CONSTRAINT difficulty_level_check CHECK ((difficulty_level = ANY (ARRAY['Beginner'::text, 'Intermediate'::text, 'Advanced'::text])))
);


--
-- Name: workout_session_totals; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.workout_session_totals WITH (security_invoker='true') AS
 SELECT wl.id AS workout_log_id,
    wl.user_id,
    wl.routine_id,
    wl.log_date,
    wl.duration_minutes,
    wl.calories_burned,
    wl.is_complete,
    count(DISTINCT wle.exercise_id) AS unique_exercises,
    count(*) AS total_sets,
    sum(wle.volume_lbs) AS total_volume_lbs,
    avg(wle.volume_lbs) FILTER (WHERE (wle.volume_lbs > (0)::numeric)) AS avg_volume_per_set,
    max(wle.volume_lbs) AS max_volume_single_set,
    max(wle.weight_lbs) AS max_weight_lbs,
    avg(wle.weight_lbs) FILTER (WHERE (wle.weight_lbs > (0)::numeric)) AS avg_weight_lbs,
    sum(wle.reps_completed) AS total_reps,
    avg(wle.reps_completed) AS avg_reps_per_set,
    avg(wle.rpe_rating) FILTER (WHERE (wle.rpe_rating IS NOT NULL)) AS avg_rpe,
    max(wle.rpe_rating) AS max_rpe,
    min(wle.created_at) AS first_set_time,
    max(wle.created_at) AS last_set_time
   FROM (public.workout_logs wl
     LEFT JOIN public.workout_log_entries wle ON ((wl.id = wle.workout_log_id)))
  GROUP BY wl.id, wl.user_id, wl.routine_id, wl.log_date, wl.duration_minutes, wl.calories_burned, wl.is_complete;


--
-- Name: VIEW workout_session_totals; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.workout_session_totals IS 'Pre-aggregated workout session statistics for performance. Eliminates client-side calculations.';


--
-- Name: xp_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.xp_transactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    amount integer NOT NULL,
    source text NOT NULL,
    reference_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2025_11_26; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_11_26 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_11_27; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_11_27 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_11_28; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_11_28 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_11_29; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_11_29 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_11_30; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_11_30 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_01; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_01 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_12_02; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_12_02 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: messages_2025_11_26; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_26 FOR VALUES FROM ('2025-11-26 00:00:00') TO ('2025-11-27 00:00:00');


--
-- Name: messages_2025_11_27; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_27 FOR VALUES FROM ('2025-11-27 00:00:00') TO ('2025-11-28 00:00:00');


--
-- Name: messages_2025_11_28; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_28 FOR VALUES FROM ('2025-11-28 00:00:00') TO ('2025-11-29 00:00:00');


--
-- Name: messages_2025_11_29; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_29 FOR VALUES FROM ('2025-11-29 00:00:00') TO ('2025-11-30 00:00:00');


--
-- Name: messages_2025_11_30; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_30 FOR VALUES FROM ('2025-11-30 00:00:00') TO ('2025-12-01 00:00:00');


--
-- Name: messages_2025_12_01; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_01 FOR VALUES FROM ('2025-12-01 00:00:00') TO ('2025-12-02 00:00:00');


--
-- Name: messages_2025_12_02; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_12_02 FOR VALUES FROM ('2025-12-02 00:00:00') TO ('2025-12-03 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: bug_reports ticket_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_reports ALTER COLUMN ticket_id SET DEFAULT nextval('public.bug_reports_ticket_id_seq'::regclass);


--
-- Name: app_metrics app_metrics_pkey; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.app_metrics
    ADD CONSTRAINT app_metrics_pkey PRIMARY KEY (id);


--
-- Name: page_views page_views_pkey; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.page_views
    ADD CONSTRAINT page_views_pkey PRIMARY KEY (id);


--
-- Name: user_actions user_actions_pkey; Type: CONSTRAINT; Schema: analytics; Owner: -
--

ALTER TABLE ONLY analytics.user_actions
    ADD CONSTRAINT user_actions_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: marketing; Owner: -
--

ALTER TABLE ONLY marketing.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: landing_pages landing_pages_pkey; Type: CONSTRAINT; Schema: marketing; Owner: -
--

ALTER TABLE ONLY marketing.landing_pages
    ADD CONSTRAINT landing_pages_pkey PRIMARY KEY (id);


--
-- Name: landing_pages landing_pages_slug_key; Type: CONSTRAINT; Schema: marketing; Owner: -
--

ALTER TABLE ONLY marketing.landing_pages
    ADD CONSTRAINT landing_pages_slug_key UNIQUE (slug);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: marketing; Owner: -
--

ALTER TABLE ONLY marketing.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: achievements achievements_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_code_key UNIQUE (code);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: body_metrics body_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.body_metrics
    ADD CONSTRAINT body_metrics_pkey PRIMARY KEY (id);


--
-- Name: bug_report_replies bug_report_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_report_replies
    ADD CONSTRAINT bug_report_replies_pkey PRIMARY KEY (id);


--
-- Name: bug_reports bug_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_reports
    ADD CONSTRAINT bug_reports_pkey PRIMARY KEY (id);


--
-- Name: bug_reports bug_reports_ticket_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_reports
    ADD CONSTRAINT bug_reports_ticket_id_key UNIQUE (ticket_id);


--
-- Name: cycle_sessions cycle_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cycle_sessions
    ADD CONSTRAINT cycle_sessions_pkey PRIMARY KEY (id);


--
-- Name: direct_messages direct_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT direct_messages_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns email_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_pkey PRIMARY KEY (id);


--
-- Name: email_events email_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_events
    ADD CONSTRAINT email_events_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_name_key UNIQUE (name);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: exercises exercises_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_name_key UNIQUE (name);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (id);


--
-- Name: foods foods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.foods
    ADD CONSTRAINT foods_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: meal_foods meal_foods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_foods
    ADD CONSTRAINT meal_foods_pkey PRIMARY KEY (id);


--
-- Name: meals meals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_pkey PRIMARY KEY (id);


--
-- Name: mesocycle_weeks mesocycle_weeks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesocycle_weeks
    ADD CONSTRAINT mesocycle_weeks_pkey PRIMARY KEY (id);


--
-- Name: mesocycles mesocycles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesocycles
    ADD CONSTRAINT mesocycles_pkey PRIMARY KEY (id);


--
-- Name: muscle_groups muscle_groups_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.muscle_groups
    ADD CONSTRAINT muscle_groups_name_key UNIQUE (name);


--
-- Name: muscle_groups muscle_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.muscle_groups
    ADD CONSTRAINT muscle_groups_pkey PRIMARY KEY (id);


--
-- Name: nutrition_enrichment_queue nutrition_enrichment_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_enrichment_queue
    ADD CONSTRAINT nutrition_enrichment_queue_pkey PRIMARY KEY (id);


--
-- Name: nutrition_logs nutrition_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_logs
    ADD CONSTRAINT nutrition_logs_pkey PRIMARY KEY (id);


--
-- Name: nutrition_pipeline_status nutrition_pipeline_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_pipeline_status
    ADD CONSTRAINT nutrition_pipeline_status_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: portions portions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portions
    ADD CONSTRAINT portions_pkey PRIMARY KEY (id);


--
-- Name: pro_routine_exercises pro_routine_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pro_routine_exercises
    ADD CONSTRAINT pro_routine_exercises_pkey PRIMARY KEY (id);


--
-- Name: pro_routines pro_routines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pro_routines
    ADD CONSTRAINT pro_routines_pkey PRIMARY KEY (id);


--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);


--
-- Name: routine_exercises routine_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routine_exercises
    ADD CONSTRAINT routine_exercises_pkey PRIMARY KEY (id);


--
-- Name: scheduled_routines scheduled_routines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_routines
    ADD CONSTRAINT scheduled_routines_pkey PRIMARY KEY (id);


--
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: trainer_clients trainer_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainer_clients
    ADD CONSTRAINT trainer_clients_pkey PRIMARY KEY (id);


--
-- Name: trainer_clients trainer_clients_trainer_id_client_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainer_clients
    ADD CONSTRAINT trainer_clients_trainer_id_client_id_key UNIQUE (trainer_id, client_id);


--
-- Name: trainer_email_templates trainer_email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainer_email_templates
    ADD CONSTRAINT trainer_email_templates_pkey PRIMARY KEY (id);


--
-- Name: trainer_group_tags trainer_group_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainer_group_tags
    ADD CONSTRAINT trainer_group_tags_pkey PRIMARY KEY (id);


--
-- Name: trainer_group_tags trainer_group_tags_trainer_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainer_group_tags
    ADD CONSTRAINT trainer_group_tags_trainer_id_name_key UNIQUE (trainer_id, name);


--
-- Name: weekly_meal_plan_entries unique_plan_date_meal_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_meal_plan_entries
    ADD CONSTRAINT unique_plan_date_meal_type UNIQUE (plan_id, plan_date, meal_type);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_user_id_achievement_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id);


--
-- Name: user_meal_foods user_meal_foods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_meal_foods
    ADD CONSTRAINT user_meal_foods_pkey PRIMARY KEY (id);


--
-- Name: user_meals user_meals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_meals
    ADD CONSTRAINT user_meals_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_stats user_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_pkey PRIMARY KEY (id);


--
-- Name: user_stats user_stats_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_user_id_key UNIQUE (user_id);


--
-- Name: user_tags user_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tags
    ADD CONSTRAINT user_tags_pkey PRIMARY KEY (id);


--
-- Name: user_tags user_tags_user_id_tag_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tags
    ADD CONSTRAINT user_tags_user_id_tag_id_key UNIQUE (user_id, tag_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: weekly_meal_plan_entries weekly_meal_plan_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_meal_plan_entries
    ADD CONSTRAINT weekly_meal_plan_entries_pkey PRIMARY KEY (id);


--
-- Name: weekly_meal_plans weekly_meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_meal_plans
    ADD CONSTRAINT weekly_meal_plans_pkey PRIMARY KEY (id);


--
-- Name: workout_log_entries workout_log_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_log_entries
    ADD CONSTRAINT workout_log_entries_pkey PRIMARY KEY (id);


--
-- Name: workout_logs workout_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_logs
    ADD CONSTRAINT workout_logs_pkey PRIMARY KEY (id);


--
-- Name: workout_routines workout_routines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_routines
    ADD CONSTRAINT workout_routines_pkey PRIMARY KEY (id);


--
-- Name: xp_transactions xp_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.xp_transactions
    ADD CONSTRAINT xp_transactions_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_26 messages_2025_11_26_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_11_26
    ADD CONSTRAINT messages_2025_11_26_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_27 messages_2025_11_27_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_11_27
    ADD CONSTRAINT messages_2025_11_27_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_28 messages_2025_11_28_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_11_28
    ADD CONSTRAINT messages_2025_11_28_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_29 messages_2025_11_29_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_11_29
    ADD CONSTRAINT messages_2025_11_29_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_30 messages_2025_11_30_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_11_30
    ADD CONSTRAINT messages_2025_11_30_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_01 messages_2025_12_01_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_01
    ADD CONSTRAINT messages_2025_12_01_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_12_02 messages_2025_12_02_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_12_02
    ADD CONSTRAINT messages_2025_12_02_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: idx_app_metrics_created_at; Type: INDEX; Schema: analytics; Owner: -
--

CREATE INDEX idx_app_metrics_created_at ON analytics.app_metrics USING btree (created_at);


--
-- Name: idx_app_metrics_metric_name; Type: INDEX; Schema: analytics; Owner: -
--

CREATE INDEX idx_app_metrics_metric_name ON analytics.app_metrics USING btree (metric_name);


--
-- Name: idx_page_views_created_at; Type: INDEX; Schema: analytics; Owner: -
--

CREATE INDEX idx_page_views_created_at ON analytics.page_views USING btree (created_at);


--
-- Name: idx_page_views_page_path; Type: INDEX; Schema: analytics; Owner: -
--

CREATE INDEX idx_page_views_page_path ON analytics.page_views USING btree (page_path);


--
-- Name: idx_user_actions_created_at; Type: INDEX; Schema: analytics; Owner: -
--

CREATE INDEX idx_user_actions_created_at ON analytics.user_actions USING btree (created_at);


--
-- Name: idx_user_actions_user_id; Type: INDEX; Schema: analytics; Owner: -
--

CREATE INDEX idx_user_actions_user_id ON analytics.user_actions USING btree (user_id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_campaigns_status; Type: INDEX; Schema: marketing; Owner: -
--

CREATE INDEX idx_campaigns_status ON marketing.campaigns USING btree (status);


--
-- Name: idx_leads_created_at; Type: INDEX; Schema: marketing; Owner: -
--

CREATE INDEX idx_leads_created_at ON marketing.leads USING btree (created_at);


--
-- Name: idx_leads_email; Type: INDEX; Schema: marketing; Owner: -
--

CREATE INDEX idx_leads_email ON marketing.leads USING btree (email);


--
-- Name: exercises_difficulty_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercises_difficulty_idx ON public.exercises USING btree (difficulty_level) WHERE (difficulty_level IS NOT NULL);


--
-- Name: exercises_equipment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercises_equipment_idx ON public.exercises USING btree (equipment_needed) WHERE (equipment_needed IS NOT NULL);


--
-- Name: exercises_muscle_equipment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercises_muscle_equipment_idx ON public.exercises USING btree (primary_muscle, equipment_needed);


--
-- Name: exercises_name_trgm_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercises_name_trgm_idx ON public.exercises USING gin (name public.gin_trgm_ops);


--
-- Name: exercises_primary_muscle_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercises_primary_muscle_idx ON public.exercises USING btree (primary_muscle) WHERE (primary_muscle IS NOT NULL);


--
-- Name: exercises_secondary_muscle_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercises_secondary_muscle_idx ON public.exercises USING btree (secondary_muscle) WHERE (secondary_muscle IS NOT NULL);


--
-- Name: exercises_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX exercises_type_idx ON public.exercises USING btree (exercise_type) WHERE (exercise_type IS NOT NULL);


--
-- Name: idx_achievements_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_achievements_category ON public.achievements USING btree (category);


--
-- Name: idx_achievements_trigger_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_achievements_trigger_type ON public.achievements USING btree (trigger_type);


--
-- Name: idx_body_metrics_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_body_metrics_user_date ON public.body_metrics USING btree (user_id, measurement_date);


--
-- Name: idx_body_metrics_weight_kg; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_body_metrics_weight_kg ON public.body_metrics USING btree (weight_kg, measurement_date) WHERE (weight_kg IS NOT NULL);


--
-- Name: idx_bug_report_replies_bug_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bug_report_replies_bug_report_id ON public.bug_report_replies USING btree (bug_report_id);


--
-- Name: idx_bug_report_replies_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bug_report_replies_created_at ON public.bug_report_replies USING btree (created_at DESC);


--
-- Name: idx_bug_report_replies_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bug_report_replies_user_id ON public.bug_report_replies USING btree (user_id);


--
-- Name: idx_bug_reports_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bug_reports_created_at ON public.bug_reports USING btree (created_at DESC);


--
-- Name: idx_bug_reports_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bug_reports_priority ON public.bug_reports USING btree (priority);


--
-- Name: idx_bug_reports_resolved_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bug_reports_resolved_by ON public.bug_reports USING btree (resolved_by);


--
-- Name: idx_bug_reports_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bug_reports_status ON public.bug_reports USING btree (status);


--
-- Name: idx_bug_reports_status_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bug_reports_status_priority ON public.bug_reports USING btree (status, priority);


--
-- Name: idx_bug_reports_ticket_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bug_reports_ticket_id ON public.bug_reports USING btree (ticket_id);


--
-- Name: idx_bug_reports_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bug_reports_user_id ON public.bug_reports USING btree (user_id);


--
-- Name: idx_campaigns_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_campaigns_created_at ON public.email_campaigns USING btree (created_at DESC);


--
-- Name: idx_cycle_sessions_mesocycle_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cycle_sessions_mesocycle_date ON public.cycle_sessions USING btree (mesocycle_id, scheduled_date);


--
-- Name: idx_cycle_sessions_routine_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cycle_sessions_routine_id ON public.cycle_sessions USING btree (routine_id);


--
-- Name: idx_cycle_sessions_user_routine_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cycle_sessions_user_routine_date ON public.cycle_sessions USING btree (user_id, routine_id, scheduled_date);


--
-- Name: idx_direct_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_direct_messages_conversation ON public.direct_messages USING btree (sender_id, recipient_id, created_at DESC);


--
-- Name: idx_direct_messages_needs_response; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_direct_messages_needs_response ON public.direct_messages USING btree (recipient_id, needs_response) WHERE (needs_response = true);


--
-- Name: idx_direct_messages_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_direct_messages_recipient ON public.direct_messages USING btree (recipient_id);


--
-- Name: idx_direct_messages_sender; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_direct_messages_sender ON public.direct_messages USING btree (sender_id);


--
-- Name: idx_direct_messages_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_direct_messages_unread ON public.direct_messages USING btree (recipient_id, created_at DESC) WHERE (read_at IS NULL);


--
-- Name: idx_email_events_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_events_campaign_id ON public.email_events USING btree (campaign_id);


--
-- Name: idx_email_events_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_events_email ON public.email_events USING btree (user_email);


--
-- Name: idx_email_events_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_email_events_type ON public.email_events USING btree (event_type);


--
-- Name: idx_enrichment_queue_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enrichment_queue_created_at ON public.nutrition_enrichment_queue USING btree (created_at DESC);


--
-- Name: idx_enrichment_queue_food_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enrichment_queue_food_id ON public.nutrition_enrichment_queue USING btree (food_id);


--
-- Name: idx_enrichment_queue_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enrichment_queue_priority ON public.nutrition_enrichment_queue USING btree (priority, created_at);


--
-- Name: idx_enrichment_queue_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enrichment_queue_status ON public.nutrition_enrichment_queue USING btree (status);


--
-- Name: idx_foods_brand; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_foods_brand ON public.foods USING gin (brand_owner public.gin_trgm_ops);


--
-- Name: idx_foods_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_foods_category ON public.foods USING btree (category);


--
-- Name: idx_foods_commonness_score; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_foods_commonness_score ON public.foods USING btree (commonness_score DESC);


--
-- Name: idx_foods_last_logged; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_foods_last_logged ON public.foods USING btree (last_logged_at DESC);


--
-- Name: idx_foods_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_foods_name ON public.foods USING gin (name public.gin_trgm_ops);


--
-- Name: idx_foods_name_lower; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_foods_name_lower ON public.foods USING btree (lower(name));


--
-- Name: idx_foods_name_simplified; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_foods_name_simplified ON public.foods USING gin (to_tsvector('english'::regconfig, name_simplified));


--
-- Name: idx_foods_search_ranking; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_foods_search_ranking ON public.foods USING btree (commonness_score DESC, category, name);


--
-- Name: idx_foods_search_tokens; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_foods_search_tokens ON public.foods USING gin (to_tsvector('english'::regconfig, search_tokens));


--
-- Name: idx_foods_times_logged; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_foods_times_logged ON public.foods USING btree (times_logged DESC);


--
-- Name: idx_goals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_goals_user_id ON public.goals USING btree (user_id);


--
-- Name: idx_meal_foods_food_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_foods_food_id ON public.meal_foods USING btree (food_id);


--
-- Name: idx_meal_foods_meal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_foods_meal ON public.meal_foods USING btree (meal_id);


--
-- Name: idx_meal_plan_entries_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_plan_entries_date ON public.weekly_meal_plan_entries USING btree (plan_date);


--
-- Name: idx_meal_plan_entries_meal_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_plan_entries_meal_id ON public.weekly_meal_plan_entries USING btree (meal_id);


--
-- Name: idx_meal_plan_entries_plan_date_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_plan_entries_plan_date_type ON public.weekly_meal_plan_entries USING btree (plan_id, plan_date, meal_type);


--
-- Name: idx_meal_plan_entries_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_plan_entries_plan_id ON public.weekly_meal_plan_entries USING btree (plan_id);


--
-- Name: idx_meals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meals_user_id ON public.meals USING btree (user_id);


--
-- Name: idx_mesocycle_weeks_is_complete; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mesocycle_weeks_is_complete ON public.mesocycle_weeks USING btree (mesocycle_id, is_complete);


--
-- Name: idx_mesocycle_weeks_mesocycle_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mesocycle_weeks_mesocycle_id ON public.mesocycle_weeks USING btree (mesocycle_id);


--
-- Name: idx_mesocycle_weeks_routine_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mesocycle_weeks_routine_id ON public.mesocycle_weeks USING btree (routine_id);


--
-- Name: idx_mesocycles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mesocycles_user_id ON public.mesocycles USING btree (user_id);


--
-- Name: idx_nutrition_logs_date_desc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutrition_logs_date_desc ON public.nutrition_logs USING btree (log_date DESC, user_id);


--
-- Name: idx_nutrition_logs_food_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutrition_logs_food_id ON public.nutrition_logs USING btree (food_id);


--
-- Name: idx_nutrition_logs_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutrition_logs_user_date ON public.nutrition_logs USING btree (user_id, log_date);


--
-- Name: idx_nutrition_logs_user_date_macros; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutrition_logs_user_date_macros ON public.nutrition_logs USING btree (user_id, log_date) INCLUDE (calories, protein_g, carbs_g, fat_g, quantity_consumed);


--
-- Name: idx_portions_food; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_portions_food ON public.portions USING btree (food_id);


--
-- Name: idx_pro_routine_exercises_exercise_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pro_routine_exercises_exercise_id ON public.pro_routine_exercises USING btree (exercise_id);


--
-- Name: idx_pro_routine_exercises_routine_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pro_routine_exercises_routine_order ON public.pro_routine_exercises USING btree (routine_id, exercise_order);


--
-- Name: idx_programs_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_programs_created_by ON public.programs USING btree (created_by);


--
-- Name: idx_programs_difficulty; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_programs_difficulty ON public.programs USING btree (difficulty_level);


--
-- Name: idx_programs_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_programs_is_active ON public.programs USING btree (is_active);


--
-- Name: idx_programs_trainer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_programs_trainer_id ON public.programs USING btree (trainer_id);


--
-- Name: idx_routine_exercises_exercise_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_routine_exercises_exercise_id ON public.routine_exercises USING btree (exercise_id);


--
-- Name: idx_routine_exercises_routine_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_routine_exercises_routine_order ON public.routine_exercises USING btree (routine_id, exercise_order);


--
-- Name: idx_scheduled_routines_client_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_routines_client_email ON public.scheduled_routines USING btree (client_email);


--
-- Name: idx_scheduled_routines_routine_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_routines_routine_id ON public.scheduled_routines USING btree (routine_id);


--
-- Name: idx_scheduled_routines_scheduled_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_routines_scheduled_date ON public.scheduled_routines USING btree (scheduled_date);


--
-- Name: idx_scheduled_routines_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_routines_user_date ON public.scheduled_routines USING btree (user_id, scheduled_date);


--
-- Name: idx_scheduled_routines_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_routines_user_id ON public.scheduled_routines USING btree (user_id);


--
-- Name: idx_trainer_clients_assigned_program; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trainer_clients_assigned_program ON public.trainer_clients USING btree (assigned_program_id);


--
-- Name: idx_trainer_clients_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trainer_clients_client ON public.trainer_clients USING btree (client_id, status) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_trainer_clients_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trainer_clients_email ON public.trainer_clients USING btree (email);


--
-- Name: idx_trainer_clients_email_unsubscribed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trainer_clients_email_unsubscribed ON public.trainer_clients USING btree (email, is_unsubscribed);


--
-- Name: idx_trainer_clients_generated_routines; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trainer_clients_generated_routines ON public.trainer_clients USING gin (generated_routine_ids);


--
-- Name: idx_trainer_clients_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trainer_clients_tags ON public.trainer_clients USING gin (tags);


--
-- Name: idx_trainer_clients_trainer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trainer_clients_trainer ON public.trainer_clients USING btree (trainer_id, status) WHERE ((status)::text = 'active'::text);


--
-- Name: idx_trainer_email_templates_trainer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trainer_email_templates_trainer_id ON public.trainer_email_templates USING btree (trainer_id);


--
-- Name: idx_trainer_group_tags_trainer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_trainer_group_tags_trainer_id ON public.trainer_group_tags USING btree (trainer_id);


--
-- Name: idx_user_achievements_unseen; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_achievements_unseen ON public.user_achievements USING btree (user_id, seen) WHERE (seen = false);


--
-- Name: idx_user_achievements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements USING btree (user_id);


--
-- Name: idx_user_meal_foods_food_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_meal_foods_food_id ON public.user_meal_foods USING btree (food_id);


--
-- Name: idx_user_meal_foods_user_meal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_meal_foods_user_meal ON public.user_meal_foods USING btree (user_meal_id);


--
-- Name: idx_user_meal_foods_user_meal_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_meal_foods_user_meal_id ON public.user_meal_foods USING btree (user_meal_id);


--
-- Name: idx_user_meals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_meals_user_id ON public.user_meals USING btree (user_id);


--
-- Name: idx_user_profiles_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_email ON public.user_profiles USING btree (email);


--
-- Name: idx_user_profiles_height_feet; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_height_feet ON public.user_profiles USING btree (height_feet) WHERE (height_feet IS NOT NULL);


--
-- Name: idx_user_profiles_is_beta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_is_beta ON public.user_profiles USING btree (is_beta) WHERE (is_beta = true);


--
-- Name: idx_user_profiles_plan_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_profiles_plan_type ON public.user_profiles USING btree (plan_type);


--
-- Name: idx_user_stats_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_stats_user_id ON public.user_stats USING btree (user_id);


--
-- Name: idx_user_tags_assigned_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_tags_assigned_by ON public.user_tags USING btree (assigned_by);


--
-- Name: idx_user_tags_tag_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_tags_tag_id ON public.user_tags USING btree (tag_id);


--
-- Name: idx_user_tags_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_tags_user_id ON public.user_tags USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_unsubscribed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_unsubscribed ON public.users USING btree (is_unsubscribed);


--
-- Name: idx_weekly_meal_plan_entries_plan_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_meal_plan_entries_plan_date ON public.weekly_meal_plan_entries USING btree (plan_id, plan_date);


--
-- Name: idx_weekly_meal_plan_entries_user_meal_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_meal_plan_entries_user_meal_id ON public.weekly_meal_plan_entries USING btree (user_meal_id);


--
-- Name: idx_weekly_meal_plan_nutrition_plan_date; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_weekly_meal_plan_nutrition_plan_date ON public.weekly_meal_plan_nutrition USING btree (plan_id, plan_date);


--
-- Name: idx_weekly_meal_plan_nutrition_plan_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_meal_plan_nutrition_plan_id ON public.weekly_meal_plan_nutrition USING btree (plan_id);


--
-- Name: idx_weekly_meal_plans_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_meal_plans_active ON public.weekly_meal_plans USING btree (user_id, is_active) WHERE (is_active = true);


--
-- Name: idx_weekly_meal_plans_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_meal_plans_dates ON public.weekly_meal_plans USING btree (start_date, end_date);


--
-- Name: idx_weekly_meal_plans_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_meal_plans_user_id ON public.weekly_meal_plans USING btree (user_id);


--
-- Name: idx_workout_log_entries_exercise_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_log_entries_exercise_date ON public.workout_log_entries USING btree (exercise_id, created_at DESC);


--
-- Name: idx_workout_log_entries_exercise_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_log_entries_exercise_user ON public.workout_log_entries USING btree (exercise_id, created_at DESC) WHERE ((completed = true) AND (weight_lbs > (0)::numeric));


--
-- Name: idx_workout_log_entries_log_exercise; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_log_entries_log_exercise ON public.workout_log_entries USING btree (log_id, exercise_id);


--
-- Name: idx_workout_log_entries_log_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_log_entries_log_id ON public.workout_log_entries USING btree (workout_log_id);


--
-- Name: idx_workout_log_entries_volume; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_log_entries_volume ON public.workout_log_entries USING btree (volume_lbs DESC) WHERE (volume_lbs > (0)::numeric);


--
-- Name: idx_workout_logs_completed_sessions; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_logs_completed_sessions ON public.workout_logs USING btree (user_id, routine_id, created_at DESC) WHERE (is_complete = true);


--
-- Name: idx_workout_logs_cycle_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_logs_cycle_session ON public.workout_logs USING btree (cycle_session_id) WHERE (cycle_session_id IS NOT NULL);


--
-- Name: idx_workout_logs_routine_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_logs_routine_date ON public.workout_logs USING btree (routine_id, log_date DESC) WHERE (is_complete = true);


--
-- Name: idx_workout_logs_routine_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_logs_routine_id ON public.workout_logs USING btree (routine_id);


--
-- Name: idx_workout_logs_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_logs_user_date ON public.workout_logs USING btree (user_id, log_date);


--
-- Name: idx_workout_logs_user_date_complete; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_logs_user_date_complete ON public.workout_logs USING btree (user_id, log_date DESC, is_complete);


--
-- Name: idx_workout_logs_user_routine_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_logs_user_routine_date ON public.workout_logs USING btree (user_id, routine_id, created_at DESC);


--
-- Name: idx_workout_routines_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_routines_user_id ON public.workout_routines USING btree (user_id);


--
-- Name: idx_xp_transactions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_xp_transactions_user_id ON public.xp_transactions USING btree (user_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_26_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_11_26_inserted_at_topic_idx ON realtime.messages_2025_11_26 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_27_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_11_27_inserted_at_topic_idx ON realtime.messages_2025_11_27 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_28_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_11_28_inserted_at_topic_idx ON realtime.messages_2025_11_28 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_29_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_11_29_inserted_at_topic_idx ON realtime.messages_2025_11_29 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_30_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_11_30_inserted_at_topic_idx ON realtime.messages_2025_11_30 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_01_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_01_inserted_at_topic_idx ON realtime.messages_2025_12_01 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_12_02_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2025_12_02_inserted_at_topic_idx ON realtime.messages_2025_12_02 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: messages_2025_11_26_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_26_inserted_at_topic_idx;


--
-- Name: messages_2025_11_26_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_26_pkey;


--
-- Name: messages_2025_11_27_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_27_inserted_at_topic_idx;


--
-- Name: messages_2025_11_27_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_27_pkey;


--
-- Name: messages_2025_11_28_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_28_inserted_at_topic_idx;


--
-- Name: messages_2025_11_28_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_28_pkey;


--
-- Name: messages_2025_11_29_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_29_inserted_at_topic_idx;


--
-- Name: messages_2025_11_29_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_29_pkey;


--
-- Name: messages_2025_11_30_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_30_inserted_at_topic_idx;


--
-- Name: messages_2025_11_30_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_30_pkey;


--
-- Name: messages_2025_12_01_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_01_inserted_at_topic_idx;


--
-- Name: messages_2025_12_01_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_01_pkey;


--
-- Name: messages_2025_12_02_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_12_02_inserted_at_topic_idx;


--
-- Name: messages_2025_12_02_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_12_02_pkey;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: users trigger_sync_user_profile_email_on_auth_update; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER trigger_sync_user_profile_email_on_auth_update AFTER UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.sync_user_profile_email_on_auth_update();


--
-- Name: nutrition_logs calculate_nutrition_on_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER calculate_nutrition_on_insert BEFORE INSERT ON public.nutrition_logs FOR EACH ROW EXECUTE FUNCTION public.calculate_nutrition_from_food();


--
-- Name: nutrition_logs calculate_nutrition_on_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER calculate_nutrition_on_update BEFORE UPDATE ON public.nutrition_logs FOR EACH ROW WHEN (((old.food_id IS DISTINCT FROM new.food_id) OR (old.quantity_consumed IS DISTINCT FROM new.quantity_consumed))) EXECUTE FUNCTION public.calculate_nutrition_from_food();


--
-- Name: mesocycle_weeks mesocycle_complete_stats_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER mesocycle_complete_stats_trigger AFTER INSERT OR UPDATE ON public.mesocycle_weeks FOR EACH ROW EXECUTE FUNCTION public.update_stats_on_mesocycle_complete();


--
-- Name: nutrition_logs nutrition_log_stats_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER nutrition_log_stats_trigger AFTER INSERT ON public.nutrition_logs FOR EACH ROW EXECUTE FUNCTION public.update_stats_on_nutrition_log();


--
-- Name: weekly_meal_plan_entries refresh_meal_plan_nutrition_on_entry; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER refresh_meal_plan_nutrition_on_entry AFTER INSERT OR DELETE OR UPDATE ON public.weekly_meal_plan_entries FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_meal_plan_nutrition();


--
-- Name: user_meal_foods refresh_meal_plan_nutrition_on_foods; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER refresh_meal_plan_nutrition_on_foods AFTER INSERT OR DELETE OR UPDATE ON public.user_meal_foods FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_meal_plan_nutrition();


--
-- Name: scheduled_routines scheduled_routines_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER scheduled_routines_updated_at BEFORE UPDATE ON public.scheduled_routines FOR EACH ROW EXECUTE FUNCTION public.update_scheduled_routines_updated_at();


--
-- Name: workout_log_entries set_logged_stats_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_logged_stats_trigger AFTER INSERT ON public.workout_log_entries FOR EACH ROW EXECUTE FUNCTION public.update_stats_on_set_logged();


--
-- Name: user_profiles sync_nutrition_goals_trigger; Type: TRIGGER; Schema: public; Owner: -
--

-- DISABLED: This trigger was causing issues during user signup
-- CREATE TRIGGER sync_nutrition_goals_trigger BEFORE INSERT OR UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.sync_duplicate_nutrition_goals();


--
-- Name: routine_exercises sync_routine_exercise_details_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER sync_routine_exercise_details_trigger BEFORE INSERT OR UPDATE ON public.routine_exercises FOR EACH ROW EXECUTE FUNCTION public.sync_routine_exercise_details();


--
-- Name: trainer_clients sync_trainer_client_full_name_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER sync_trainer_client_full_name_trigger BEFORE INSERT OR UPDATE OF client_id ON public.trainer_clients FOR EACH ROW EXECUTE FUNCTION public.sync_trainer_client_full_name();


--
-- Name: user_profiles sync_trainer_client_on_profile_update_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER sync_trainer_client_on_profile_update_trigger AFTER UPDATE OF first_name, last_name ON public.user_profiles FOR EACH ROW WHEN (((old.first_name IS DISTINCT FROM new.first_name) OR (old.last_name IS DISTINCT FROM new.last_name))) EXECUTE FUNCTION public.sync_trainer_client_on_profile_update();


--
-- Name: trainer_clients trg_set_start_date; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_set_start_date BEFORE INSERT ON public.trainer_clients FOR EACH ROW EXECUTE FUNCTION public.set_start_date_from_created_at();


--
-- Name: nutrition_logs trigger_increment_food_log_count; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_increment_food_log_count AFTER INSERT ON public.nutrition_logs FOR EACH ROW EXECUTE FUNCTION public.increment_food_log_count();


--
-- Name: weekly_meal_plan_entries trigger_refresh_meal_plan_nutrition_on_entry_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_refresh_meal_plan_nutrition_on_entry_change AFTER INSERT OR DELETE OR UPDATE ON public.weekly_meal_plan_entries FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_weekly_meal_plan_nutrition();


--
-- Name: user_meal_foods trigger_refresh_meal_plan_nutrition_on_food_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_refresh_meal_plan_nutrition_on_food_change AFTER INSERT OR DELETE OR UPDATE ON public.user_meal_foods FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_weekly_meal_plan_nutrition();


--
-- Name: foods trigger_refresh_meal_plan_nutrition_on_food_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_refresh_meal_plan_nutrition_on_food_update AFTER UPDATE ON public.foods FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_weekly_meal_plan_nutrition();


--
-- Name: mesocycle_weeks trigger_sync_routine_name; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_sync_routine_name BEFORE INSERT OR UPDATE ON public.mesocycle_weeks FOR EACH ROW EXECUTE FUNCTION public.sync_routine_name_to_mesocycle_week();


--
-- Name: TRIGGER trigger_sync_routine_name ON mesocycle_weeks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TRIGGER trigger_sync_routine_name ON public.mesocycle_weeks IS 'Keeps the denormalized routine_name in sync with the routine_id.';


--
-- Name: scheduled_routines trigger_sync_scheduled_routine_client_info_on_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_sync_scheduled_routine_client_info_on_insert BEFORE INSERT ON public.scheduled_routines FOR EACH ROW WHEN (((new.client_name IS NULL) OR (new.client_email IS NULL))) EXECUTE FUNCTION public.sync_scheduled_routine_client_info();


--
-- Name: trainer_clients trigger_sync_scheduled_routine_client_info_on_trainer_client_up; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_sync_scheduled_routine_client_info_on_trainer_client_up AFTER UPDATE ON public.trainer_clients FOR EACH ROW EXECUTE FUNCTION public.sync_scheduled_routine_client_info_on_trainer_client_update();


--
-- Name: trainer_clients trigger_sync_trainer_client_email_on_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_sync_trainer_client_email_on_insert BEFORE INSERT ON public.trainer_clients FOR EACH ROW EXECUTE FUNCTION public.sync_trainer_client_email();


--
-- Name: user_profiles trigger_sync_trainer_client_email_on_profile_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_sync_trainer_client_email_on_profile_update AFTER UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.sync_trainer_client_email_on_profile_update();


--
-- Name: user_profiles trigger_sync_user_profile_email_on_insert; Type: TRIGGER; Schema: public; Owner: -
--
-- DISABLED: This trigger conflicts with handle_new_user() which already populates email
-- CREATE TRIGGER trigger_sync_user_profile_email_on_insert BEFORE INSERT ON public.user_profiles FOR EACH ROW WHEN ((new.email IS NULL)) EXECUTE FUNCTION public.sync_user_profile_email_from_auth();


--
-- Name: bug_report_replies trigger_update_bug_report_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_bug_report_timestamp AFTER INSERT ON public.bug_report_replies FOR EACH ROW EXECUTE FUNCTION public.update_bug_report_timestamp();


--
-- Name: foods trigger_update_search_helpers; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_search_helpers BEFORE INSERT OR UPDATE OF name ON public.foods FOR EACH ROW EXECUTE FUNCTION public.update_search_helpers();


--
-- Name: email_templates update_email_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: trainer_email_templates update_trainer_email_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_trainer_email_templates_updated_at BEFORE UPDATE ON public.trainer_email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: trainer_group_tags update_trainer_group_tags_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_trainer_group_tags_updated_at BEFORE UPDATE ON public.trainer_group_tags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: weekly_meal_plan_entries update_weekly_meal_plan_entries_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_weekly_meal_plan_entries_updated_at BEFORE UPDATE ON public.weekly_meal_plan_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: weekly_meal_plans update_weekly_meal_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_weekly_meal_plans_updated_at BEFORE UPDATE ON public.weekly_meal_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_meals user_meals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_meals_updated_at BEFORE UPDATE ON public.user_meals FOR EACH ROW EXECUTE FUNCTION public.update_user_meals_updated_at();


--
-- Name: workout_logs workout_complete_stats_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER workout_complete_stats_trigger AFTER INSERT OR UPDATE ON public.workout_logs FOR EACH ROW EXECUTE FUNCTION public.update_stats_on_workout_complete();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: body_metrics body_metrics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.body_metrics
    ADD CONSTRAINT body_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: bug_report_replies bug_report_replies_bug_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_report_replies
    ADD CONSTRAINT bug_report_replies_bug_report_id_fkey FOREIGN KEY (bug_report_id) REFERENCES public.bug_reports(id) ON DELETE CASCADE;


--
-- Name: bug_report_replies bug_report_replies_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_report_replies
    ADD CONSTRAINT bug_report_replies_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: bug_reports bug_reports_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_reports
    ADD CONSTRAINT bug_reports_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: bug_reports bug_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bug_reports
    ADD CONSTRAINT bug_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: cycle_sessions cycle_sessions_mesocycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cycle_sessions
    ADD CONSTRAINT cycle_sessions_mesocycle_id_fkey FOREIGN KEY (mesocycle_id) REFERENCES public.mesocycles(id) ON DELETE CASCADE;


--
-- Name: cycle_sessions cycle_sessions_routine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cycle_sessions
    ADD CONSTRAINT cycle_sessions_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.workout_routines(id) ON DELETE SET NULL;


--
-- Name: cycle_sessions cycle_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cycle_sessions
    ADD CONSTRAINT cycle_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: direct_messages direct_messages_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT direct_messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: direct_messages direct_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT direct_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: email_events email_events_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_events
    ADD CONSTRAINT email_events_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.email_campaigns(id) ON DELETE CASCADE;


--
-- Name: goals goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: meal_foods meal_foods_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_foods
    ADD CONSTRAINT meal_foods_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id) ON DELETE CASCADE;


--
-- Name: meal_foods meal_foods_meal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_foods
    ADD CONSTRAINT meal_foods_meal_id_fkey FOREIGN KEY (meal_id) REFERENCES public.meals(id) ON DELETE CASCADE;


--
-- Name: meals meals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meals
    ADD CONSTRAINT meals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mesocycle_weeks mesocycle_weeks_mesocycle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesocycle_weeks
    ADD CONSTRAINT mesocycle_weeks_mesocycle_id_fkey FOREIGN KEY (mesocycle_id) REFERENCES public.mesocycles(id) ON DELETE CASCADE;


--
-- Name: mesocycle_weeks mesocycle_weeks_routine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesocycle_weeks
    ADD CONSTRAINT mesocycle_weeks_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.workout_routines(id);


--
-- Name: mesocycles mesocycles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mesocycles
    ADD CONSTRAINT mesocycles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: nutrition_logs nutrition_logs_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_logs
    ADD CONSTRAINT nutrition_logs_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id) ON DELETE CASCADE;


--
-- Name: nutrition_logs nutrition_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_logs
    ADD CONSTRAINT nutrition_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: portions portions_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portions
    ADD CONSTRAINT portions_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id) ON DELETE CASCADE;


--
-- Name: pro_routine_exercises pro_routine_exercises_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pro_routine_exercises
    ADD CONSTRAINT pro_routine_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;


--
-- Name: pro_routine_exercises pro_routine_exercises_routine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pro_routine_exercises
    ADD CONSTRAINT pro_routine_exercises_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.pro_routines(id) ON DELETE CASCADE;


--
-- Name: programs programs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: programs programs_trainer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: routine_exercises routine_exercises_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routine_exercises
    ADD CONSTRAINT routine_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;


--
-- Name: routine_exercises routine_exercises_routine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routine_exercises
    ADD CONSTRAINT routine_exercises_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.workout_routines(id) ON DELETE CASCADE;


--
-- Name: scheduled_routines scheduled_routines_routine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_routines
    ADD CONSTRAINT scheduled_routines_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.workout_routines(id) ON DELETE CASCADE;


--
-- Name: scheduled_routines scheduled_routines_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_routines
    ADD CONSTRAINT scheduled_routines_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: trainer_clients trainer_clients_assigned_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainer_clients
    ADD CONSTRAINT trainer_clients_assigned_program_id_fkey FOREIGN KEY (assigned_program_id) REFERENCES public.programs(id) ON DELETE SET NULL;


--
-- Name: trainer_clients trainer_clients_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainer_clients
    ADD CONSTRAINT trainer_clients_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: trainer_clients trainer_clients_trainer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainer_clients
    ADD CONSTRAINT trainer_clients_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: trainer_email_templates trainer_email_templates_trainer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainer_email_templates
    ADD CONSTRAINT trainer_email_templates_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: trainer_group_tags trainer_group_tags_trainer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainer_group_tags
    ADD CONSTRAINT trainer_group_tags_trainer_id_fkey FOREIGN KEY (trainer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_meal_foods user_meal_foods_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_meal_foods
    ADD CONSTRAINT user_meal_foods_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.foods(id) ON DELETE CASCADE;


--
-- Name: user_meal_foods user_meal_foods_user_meal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_meal_foods
    ADD CONSTRAINT user_meal_foods_user_meal_id_fkey FOREIGN KEY (user_meal_id) REFERENCES public.user_meals(id) ON DELETE CASCADE;


--
-- Name: user_meals user_meals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_meals
    ADD CONSTRAINT user_meals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_plan_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_plan_type_fkey FOREIGN KEY (plan_type) REFERENCES public.plans(id);


--
-- Name: user_stats user_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_tags user_tags_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tags
    ADD CONSTRAINT user_tags_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES auth.users(id);


--
-- Name: user_tags user_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tags
    ADD CONSTRAINT user_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: user_tags user_tags_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_tags
    ADD CONSTRAINT user_tags_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: weekly_meal_plan_entries weekly_meal_plan_entries_meal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_meal_plan_entries
    ADD CONSTRAINT weekly_meal_plan_entries_meal_id_fkey FOREIGN KEY (meal_id) REFERENCES public.meals(id) ON DELETE CASCADE;


--
-- Name: weekly_meal_plan_entries weekly_meal_plan_entries_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_meal_plan_entries
    ADD CONSTRAINT weekly_meal_plan_entries_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.weekly_meal_plans(id) ON DELETE CASCADE;


--
-- Name: weekly_meal_plan_entries weekly_meal_plan_entries_user_meal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_meal_plan_entries
    ADD CONSTRAINT weekly_meal_plan_entries_user_meal_id_fkey FOREIGN KEY (user_meal_id) REFERENCES public.user_meals(id) ON DELETE CASCADE;


--
-- Name: workout_log_entries workout_log_entries_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_log_entries
    ADD CONSTRAINT workout_log_entries_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;


--
-- Name: workout_log_entries workout_log_entries_workout_log_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_log_entries
    ADD CONSTRAINT workout_log_entries_workout_log_id_fkey FOREIGN KEY (workout_log_id) REFERENCES public.workout_logs(id) ON DELETE CASCADE;


--
-- Name: workout_logs workout_logs_cycle_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_logs
    ADD CONSTRAINT workout_logs_cycle_session_id_fkey FOREIGN KEY (cycle_session_id) REFERENCES public.cycle_sessions(id) ON DELETE SET NULL;


--
-- Name: workout_logs workout_logs_routine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_logs
    ADD CONSTRAINT workout_logs_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.workout_routines(id) ON DELETE SET NULL;


--
-- Name: workout_logs workout_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_logs
    ADD CONSTRAINT workout_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: workout_routines workout_routines_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_routines
    ADD CONSTRAINT workout_routines_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: xp_transactions xp_transactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.xp_transactions
    ADD CONSTRAINT xp_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: page_views Admin can view analytics; Type: POLICY; Schema: analytics; Owner: -
--

CREATE POLICY "Admin can view analytics" ON analytics.page_views FOR SELECT USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: app_metrics Admin can view app metrics; Type: POLICY; Schema: analytics; Owner: -
--

CREATE POLICY "Admin can view app metrics" ON analytics.app_metrics FOR SELECT USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: user_actions Admin can view user actions; Type: POLICY; Schema: analytics; Owner: -
--

CREATE POLICY "Admin can view user actions" ON analytics.user_actions FOR SELECT USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: page_views Anyone can insert page views; Type: POLICY; Schema: analytics; Owner: -
--

CREATE POLICY "Anyone can insert page views" ON analytics.page_views FOR INSERT WITH CHECK (true);


--
-- Name: user_actions Anyone can insert user actions; Type: POLICY; Schema: analytics; Owner: -
--

CREATE POLICY "Anyone can insert user actions" ON analytics.user_actions FOR INSERT WITH CHECK (true);


--
-- Name: app_metrics; Type: ROW SECURITY; Schema: analytics; Owner: -
--

ALTER TABLE analytics.app_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: page_views; Type: ROW SECURITY; Schema: analytics; Owner: -
--

ALTER TABLE analytics.page_views ENABLE ROW LEVEL SECURITY;

--
-- Name: user_actions; Type: ROW SECURITY; Schema: analytics; Owner: -
--

ALTER TABLE analytics.user_actions ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: campaigns Admin can manage campaigns; Type: POLICY; Schema: marketing; Owner: -
--

CREATE POLICY "Admin can manage campaigns" ON marketing.campaigns USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: landing_pages Admin can manage landing pages; Type: POLICY; Schema: marketing; Owner: -
--

CREATE POLICY "Admin can manage landing pages" ON marketing.landing_pages USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: leads Admin can manage leads; Type: POLICY; Schema: marketing; Owner: -
--

CREATE POLICY "Admin can manage leads" ON marketing.leads USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));


--
-- Name: landing_pages Public can view active landing pages; Type: POLICY; Schema: marketing; Owner: -
--

CREATE POLICY "Public can view active landing pages" ON marketing.landing_pages FOR SELECT USING ((is_active = true));


--
-- Name: campaigns; Type: ROW SECURITY; Schema: marketing; Owner: -
--

ALTER TABLE marketing.campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: landing_pages; Type: ROW SECURITY; Schema: marketing; Owner: -
--

ALTER TABLE marketing.landing_pages ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: marketing; Owner: -
--

ALTER TABLE marketing.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: achievements Achievements are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Achievements are viewable by everyone" ON public.achievements FOR SELECT USING (true);


--
-- Name: trainer_clients Admins can manage all relationships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all relationships" ON public.trainer_clients USING (public.is_admin());


--
-- Name: exercises Admins can manage exercises; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage exercises" ON public.exercises USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: foods Admins can manage foods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage foods" ON public.foods USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: meal_foods Admins can manage meal foods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage meal foods" ON public.meal_foods USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: meals Admins can manage meals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage meals" ON public.meals USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: portions Admins can manage portions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage portions" ON public.portions USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: programs Admins can manage programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage programs" ON public.programs USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- Name: bug_report_replies Admins can reply to any bug report; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can reply to any bug report" ON public.bug_report_replies FOR INSERT WITH CHECK (public.is_admin());


--
-- Name: bug_reports Admins can update all bug reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all bug reports" ON public.bug_reports FOR UPDATE USING (public.is_admin());


--
-- Name: user_profiles Admins can update all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all profiles" ON public.user_profiles FOR UPDATE USING (public.is_admin());


--
-- Name: bug_report_replies Admins can view all bug report replies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all bug report replies" ON public.bug_report_replies FOR SELECT USING (public.is_admin());


--
-- Name: bug_reports Admins can view all bug reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all bug reports" ON public.bug_reports FOR SELECT USING (public.is_admin());


--
-- Name: user_meal_foods Admins can view all meal foods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all meal foods" ON public.user_meal_foods FOR SELECT USING (public.is_admin());


--
-- Name: weekly_meal_plan_entries Admins can view all meal plan entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all meal plan entries" ON public.weekly_meal_plan_entries FOR SELECT USING (public.is_admin());


--
-- Name: weekly_meal_plans Admins can view all meal plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all meal plans" ON public.weekly_meal_plans FOR SELECT USING (public.is_admin());


--
-- Name: user_meals Admins can view all meals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all meals" ON public.user_meals FOR SELECT USING (public.is_admin());


--
-- Name: direct_messages Admins can view all messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all messages" ON public.direct_messages FOR SELECT USING (public.is_admin());


--
-- Name: nutrition_logs Admins can view all nutrition logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all nutrition logs" ON public.nutrition_logs FOR SELECT USING (public.is_admin());


--
-- Name: user_profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.user_profiles FOR SELECT USING (public.is_admin());


--
-- Name: trainer_clients Admins can view all relationships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all relationships" ON public.trainer_clients FOR SELECT USING (public.is_admin());


--
-- Name: pro_routine_exercises Allow public read access to pro routine exercises; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public read access to pro routine exercises" ON public.pro_routine_exercises FOR SELECT TO authenticated USING (true);


--
-- Name: exercises Anyone can view exercises; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view exercises" ON public.exercises FOR SELECT USING (true);


--
-- Name: foods Anyone can view foods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view foods" ON public.foods FOR SELECT USING (true);


--
-- Name: meal_foods Anyone can view meal foods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view meal foods" ON public.meal_foods FOR SELECT USING (true);


--
-- Name: meals Anyone can view meals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view meals" ON public.meals FOR SELECT USING (true);


--
-- Name: portions Anyone can view portions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view portions" ON public.portions FOR SELECT USING (true);


--
-- Name: programs Anyone can view programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view programs" ON public.programs FOR SELECT USING (true);


--
-- Name: trainer_clients Clients can view own relationships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Clients can view own relationships" ON public.trainer_clients FOR SELECT USING ((client_id = ( SELECT auth.uid() AS uid)));


--
-- Name: trainer_group_tags Trainers can create own tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trainers can create own tags" ON public.trainer_group_tags FOR INSERT WITH CHECK ((auth.uid() = trainer_id));


--
-- Name: trainer_group_tags Trainers can delete own tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trainers can delete own tags" ON public.trainer_group_tags FOR DELETE USING ((auth.uid() = trainer_id));


--
-- Name: programs Trainers can manage their own programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trainers can manage their own programs" ON public.programs USING ((auth.uid() = trainer_id)) WITH CHECK ((auth.uid() = trainer_id));


--
-- Name: trainer_clients Trainers can update own relationships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trainers can update own relationships" ON public.trainer_clients FOR UPDATE USING ((trainer_id = ( SELECT auth.uid() AS uid)));


--
-- Name: user_meal_foods Trainers can view client meal foods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trainers can view client meal foods" ON public.user_meal_foods FOR SELECT USING ((user_meal_id IN ( SELECT user_meals.id
   FROM public.user_meals
  WHERE public.is_trainer_for_client(user_meals.user_id))));


--
-- Name: weekly_meal_plan_entries Trainers can view client meal plan entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trainers can view client meal plan entries" ON public.weekly_meal_plan_entries FOR SELECT USING ((plan_id IN ( SELECT weekly_meal_plans.id
   FROM public.weekly_meal_plans
  WHERE public.is_trainer_for_client(weekly_meal_plans.user_id))));


--
-- Name: weekly_meal_plans Trainers can view client meal plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trainers can view client meal plans" ON public.weekly_meal_plans FOR SELECT USING (public.is_trainer_for_client(user_id));


--
-- Name: user_meals Trainers can view client meals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trainers can view client meals" ON public.user_meals FOR SELECT USING (public.is_trainer_for_client(user_id));


--
-- Name: nutrition_logs Trainers can view client nutrition logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trainers can view client nutrition logs" ON public.nutrition_logs FOR SELECT USING (public.is_trainer_for_client(user_id));


--
-- Name: user_profiles Trainers can view client profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trainers can view client profiles" ON public.user_profiles FOR SELECT USING ((public.is_trainer() AND (id IN ( SELECT trainer_clients.client_id
   FROM public.trainer_clients
  WHERE ((trainer_clients.trainer_id = ( SELECT auth.uid() AS uid)) AND ((trainer_clients.status)::text = 'active'::text))))));


--
-- Name: trainer_clients Trainers can view own relationships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trainers can view own relationships" ON public.trainer_clients FOR SELECT USING ((trainer_id = ( SELECT auth.uid() AS uid)));


--
-- Name: trainer_group_tags Trainers can view own tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Trainers can view own tags" ON public.trainer_group_tags FOR SELECT USING ((auth.uid() = trainer_id));


--
-- Name: bug_reports Users can create bug reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create bug reports" ON public.bug_reports FOR INSERT WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: nutrition_logs Users can delete own nutrition logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own nutrition logs" ON public.nutrition_logs FOR DELETE USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: nutrition_logs Users can insert own nutrition logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own nutrition logs" ON public.nutrition_logs FOR INSERT WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: user_profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK ((id = ( SELECT auth.uid() AS uid)));


--
-- Name: xp_transactions Users can insert their own XP transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own XP transactions" ON public.xp_transactions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_achievements Users can insert their own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_stats Users can insert their own stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own stats" ON public.user_stats FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_meal_foods Users can manage own meal foods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own meal foods" ON public.user_meal_foods USING ((user_meal_id IN ( SELECT user_meals.id
   FROM public.user_meals
  WHERE (user_meals.user_id = auth.uid())))) WITH CHECK ((user_meal_id IN ( SELECT user_meals.id
   FROM public.user_meals
  WHERE (user_meals.user_id = auth.uid()))));


--
-- Name: weekly_meal_plan_entries Users can manage own meal plan entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own meal plan entries" ON public.weekly_meal_plan_entries USING ((plan_id IN ( SELECT weekly_meal_plans.id
   FROM public.weekly_meal_plans
  WHERE (weekly_meal_plans.user_id = ( SELECT auth.uid() AS uid))))) WITH CHECK ((plan_id IN ( SELECT weekly_meal_plans.id
   FROM public.weekly_meal_plans
  WHERE (weekly_meal_plans.user_id = ( SELECT auth.uid() AS uid)))));


--
-- Name: weekly_meal_plans Users can manage own meal plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own meal plans" ON public.weekly_meal_plans USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: user_meals Users can manage own meals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own meals" ON public.user_meals USING ((user_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: bug_report_replies Users can reply to own bug reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can reply to own bug reports" ON public.bug_report_replies FOR INSERT WITH CHECK (((user_id = ( SELECT auth.uid() AS uid)) AND (bug_report_id IN ( SELECT bug_reports.id
   FROM public.bug_reports
  WHERE (bug_reports.user_id = ( SELECT auth.uid() AS uid))))));


--
-- Name: direct_messages Users can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages" ON public.direct_messages FOR INSERT WITH CHECK ((sender_id = ( SELECT auth.uid() AS uid)));


--
-- Name: nutrition_logs Users can update own nutrition logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own nutrition logs" ON public.nutrition_logs FOR UPDATE USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: user_profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING ((id = ( SELECT auth.uid() AS uid)));


--
-- Name: user_achievements Users can update their own achievement seen status; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own achievement seen status" ON public.user_achievements FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_stats Users can update their own stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own stats" ON public.user_stats FOR UPDATE USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: bug_report_replies Users can view own bug report replies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own bug report replies" ON public.bug_report_replies FOR SELECT USING ((bug_report_id IN ( SELECT bug_reports.id
   FROM public.bug_reports
  WHERE (bug_reports.user_id = ( SELECT auth.uid() AS uid)))));


--
-- Name: bug_reports Users can view own bug reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own bug reports" ON public.bug_reports FOR SELECT USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: weekly_meal_plan_entries Users can view own meal plan entries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own meal plan entries" ON public.weekly_meal_plan_entries FOR SELECT USING ((plan_id IN ( SELECT weekly_meal_plans.id
   FROM public.weekly_meal_plans
  WHERE (weekly_meal_plans.user_id = ( SELECT auth.uid() AS uid)))));


--
-- Name: weekly_meal_plans Users can view own meal plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own meal plans" ON public.weekly_meal_plans FOR SELECT USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: user_meals Users can view own meals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own meals" ON public.user_meals FOR SELECT USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: direct_messages Users can view own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own messages" ON public.direct_messages FOR SELECT USING (((sender_id = ( SELECT auth.uid() AS uid)) OR (recipient_id = ( SELECT auth.uid() AS uid))));


--
-- Name: nutrition_logs Users can view own nutrition logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own nutrition logs" ON public.nutrition_logs FOR SELECT USING ((user_id = ( SELECT auth.uid() AS uid)));


--
-- Name: user_profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING ((id = ( SELECT auth.uid() AS uid)));


--
-- Name: xp_transactions Users can view their own XP transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own XP transactions" ON public.xp_transactions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_achievements Users can view their own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_stats Users can view their own stats; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own stats" ON public.user_stats FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: bug_report_replies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bug_report_replies ENABLE ROW LEVEL SECURITY;

--
-- Name: bug_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: direct_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: email_campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: email_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

--
-- Name: email_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: exercises; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

--
-- Name: foods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;

--
-- Name: meal_foods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meal_foods ENABLE ROW LEVEL SECURITY;

--
-- Name: meals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

--
-- Name: nutrition_enrichment_queue; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutrition_enrichment_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: nutrition_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: portions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.portions ENABLE ROW LEVEL SECURITY;

--
-- Name: pro_routine_exercises; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pro_routine_exercises ENABLE ROW LEVEL SECURITY;

--
-- Name: programs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

--
-- Name: trainer_clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trainer_clients ENABLE ROW LEVEL SECURITY;

--
-- Name: trainer_email_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trainer_email_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: trainer_group_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trainer_group_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles trainers_can_search_users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY trainers_can_search_users ON public.user_profiles FOR SELECT TO authenticated USING (public.is_trainer());


--
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: user_meal_foods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_meal_foods ENABLE ROW LEVEL SECURITY;

--
-- Name: user_meals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_meals ENABLE ROW LEVEL SECURITY;

--
-- Name: user_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_stats; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

--
-- Name: user_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_meal_plan_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weekly_meal_plan_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_meal_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weekly_meal_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: xp_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict BsZgZ4evoCoHGz4suacXbaV4ccWSkzO89BSaQkh7DObCgSQoNJKG4IVnckFTuF9

