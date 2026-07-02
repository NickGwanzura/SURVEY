-- Migration: add National Certificate to education_level enum
ALTER TYPE "public"."education_level" ADD VALUE 'national_certificate' BEFORE 'diploma';
