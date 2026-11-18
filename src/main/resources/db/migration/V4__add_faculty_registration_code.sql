ALTER TABLE faculty
ADD COLUMN faculty_id VARCHAR(50);

CREATE UNIQUE INDEX uq_faculty_faculty_id
ON faculty(faculty_id);