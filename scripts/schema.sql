-- ==============================================================================
-- UTP CLASS INTELLIGENCE - FULL PRODUCTION DATABASE SCHEMA
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_code VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    career VARCHAR(150) DEFAULT 'Ingeniería',
    campus VARCHAR(100) DEFAULT 'Campus Digital',
    cycle INTEGER DEFAULT 7,
    reputation_score INTEGER DEFAULT 100,
    wallet_balance_cents INTEGER DEFAULT 0,
    locked_escrow_cents INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDY BEACONS TABLE (Networking & Huecos en Común)
CREATE TABLE IF NOT EXISTS public.study_beacons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    host_name VARCHAR(150) NOT NULL,
    host_code VARCHAR(50),
    host_career VARCHAR(150),
    course_id VARCHAR(50) NOT NULL,
    course_name VARCHAR(150) NOT NULL,
    location_name VARCHAR(200) NOT NULL,
    objective TEXT NOT NULL,
    max_collaborators INTEGER DEFAULT 4,
    current_collaborators INTEGER DEFAULT 1,
    collaborator_ids JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FULL', 'COMPLETED', 'EXPIRED')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMMUNITY POSTS (Comunidad & Foro Académico)
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    author_name VARCHAR(150) NOT NULL,
    author_code VARCHAR(50),
    author_career VARCHAR(150),
    course_id VARCHAR(50),
    category VARCHAR(50) NOT NULL CHECK (category IN ('ACADEMIC_QUESTION', 'PROJECT_RECRUITMENT', 'STUDY_TIPS', 'GENERAL')),
    title VARCHAR(250) NOT NULL,
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]'::jsonb,
    upvotes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    upvoted_by JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMMUNITY COMMENTS
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    author_name VARCHAR(150) NOT NULL,
    author_career VARCHAR(150),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACADEMIC SERVICES (Marketplace Académico & Mentorías)
CREATE TABLE IF NOT EXISTS public.academic_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    mentor_name VARCHAR(150) NOT NULL,
    mentor_code VARCHAR(50),
    mentor_career VARCHAR(150),
    course_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('MOCK_DEFENSE', 'TUTORING_1ON1', 'CODE_REVIEW')),
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    rating_avg NUMERIC(3, 2) DEFAULT 5.0,
    total_reviews INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ESCROW TRANSACTIONS (Garantía Escrow)
CREATE TABLE IF NOT EXISTS public.escrow_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES public.academic_services(id) ON DELETE RESTRICT,
    buyer_id UUID REFERENCES public.students(id) ON DELETE RESTRICT,
    seller_id UUID REFERENCES public.students(id) ON DELETE RESTRICT,
    amount_cents INTEGER NOT NULL,
    status VARCHAR(30) DEFAULT 'HELD_IN_ESCROW' CHECK (status IN ('HELD_IN_ESCROW', 'RELEASED', 'REFUNDED', 'DISPUTED')),
    payment_method VARCHAR(20) DEFAULT 'YAPE' CHECK (payment_method IN ('YAPE', 'PLIN', 'WALLET')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    released_at TIMESTAMPTZ
);

-- 7. OFFICIAL SYLLABI CATALOG (Sílabos oficiales indexados)
CREATE TABLE IF NOT EXISTS public.official_syllabi (
    course_id VARCHAR(50) PRIMARY KEY,
    course_code VARCHAR(50) NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    credits INTEGER DEFAULT 3,
    hours VARCHAR(50),
    modality VARCHAR(50),
    formula TEXT,
    learning_goal TEXT,
    evaluations JSONB DEFAULT '[]'::jsonb,
    weekly_schedule JSONB DEFAULT '[]'::jsonb,
    rules JSONB DEFAULT '[]'::jsonb,
    anti_plagiarism_policy TEXT,
    pdf_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TASKS AND DELIVERABLES (Tareas y Entregables oficiales)
CREATE TABLE IF NOT EXISTS public.tasks_and_deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id VARCHAR(50) NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    title VARCHAR(200) NOT NULL,
    week_number INTEGER NOT NULL,
    due_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUBMITTED', 'GRADED')),
    evaluation_code VARCHAR(50),
    weight_percentage INTEGER DEFAULT 0,
    rubric JSONB,
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_beacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_syllabi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks_and_deliverables ENABLE ROW LEVEL SECURITY;

-- Allow public reads and writes for app operational functionality
CREATE POLICY "Allow public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update students" ON public.students FOR UPDATE USING (true);

CREATE POLICY "Allow public read beacons" ON public.study_beacons FOR SELECT USING (true);
CREATE POLICY "Allow public insert beacons" ON public.study_beacons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update beacons" ON public.study_beacons FOR UPDATE USING (true);

CREATE POLICY "Allow public read posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Allow public insert posts" ON public.community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update posts" ON public.community_posts FOR UPDATE USING (true);

CREATE POLICY "Allow public read comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert comments" ON public.community_comments FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read services" ON public.academic_services FOR SELECT USING (true);
CREATE POLICY "Allow public insert services" ON public.academic_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update services" ON public.academic_services FOR UPDATE USING (true);

CREATE POLICY "Allow public read transactions" ON public.escrow_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert transactions" ON public.escrow_transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read syllabi" ON public.official_syllabi FOR SELECT USING (true);
CREATE POLICY "Allow public insert syllabi" ON public.official_syllabi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update syllabi" ON public.official_syllabi FOR UPDATE USING (true);

CREATE POLICY "Allow public read tasks" ON public.tasks_and_deliverables FOR SELECT USING (true);
CREATE POLICY "Allow public insert tasks" ON public.tasks_and_deliverables FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tasks" ON public.tasks_and_deliverables FOR UPDATE USING (true);
