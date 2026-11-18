-- V2: Add personal_email to students table and add unique constraints for personal emails
ALTER TABLE students ADD COLUMN personal_email VARCHAR(255);
ALTER TABLE students ADD CONSTRAINT uq_students_personal_email UNIQUE (personal_email);
ALTER TABLE faculty ADD CONSTRAINT uq_faculty_personal_email UNIQUE (personal_email);
