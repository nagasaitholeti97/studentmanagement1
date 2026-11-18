package com.sams.config;

import com.sams.model.CollegeClass;
import com.sams.model.Enrollment;
import com.sams.model.Faculty;
import com.sams.model.Role;
import com.sams.model.Student;
import com.sams.model.Subject;
import com.sams.model.UserAccount;
import com.sams.repository.ClassRepository;
import com.sams.repository.EnrollmentRepository;
import com.sams.repository.FacultyRepository;
import com.sams.repository.StudentRepository;
import com.sams.repository.SubjectRepository;
import com.sams.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DemoDataConfig {

    @Bean
    CommandLineRunner seed(UserRepository users, StudentRepository students, FacultyRepository faculty,
                          ClassRepository classes, SubjectRepository subjects, EnrollmentRepository enrollments,
                          PasswordEncoder enc) {
        return args -> {
            if (users.count() > 0) return;

            UserAccount fu = new UserAccount();
            fu.setEmail("faculty@college.edu");
            fu.setLoginId("f-001");
            fu.setPasswordHash(enc.encode("faculty123"));
            fu.setRole(Role.FACULTY);
            users.save(fu);

            Faculty f = new Faculty();
            f.setUser(fu);
            f.setFullName("Dr. Suresh Kumar");
            f.setDesignation("Associate Professor");
            f.setDepartment("Electronics & Communication");
            f.setPersonalEmail("suresh.kumar@example.com");
            f.setPhone("+91 90000 20001");
            f.setGender("Male");
            f.setQualification("Ph.D. (Signal Processing), M.Tech (ECE)");
            f.setAge(42);
            f.setExperienceYears(14);
            faculty.save(f);

            CollegeClass c = new CollegeClass();
            c.setCode("ece-3a");
            c.setLabel("3-Year ECE-A");
            c.setYearNumber(3);
            c.setSection("ECE-A");
            c.setSemester("5");
            classes.save(c);

            Subject sub = new Subject();
            sub.setCollegeClass(c);
            sub.setFaculty(f);
            sub.setName("Signals & Systems");
            sub.setCode("ECE301");
            subjects.save(sub);

            String[][] demo = {
                {"22EC1021", "Karthik Rao", "karthik@college.edu", "karthik.rao@gmail.com"},
                {"22EC1022", "Meera Nair", "meera@college.edu", "meera.nair@gmail.com"},
                {"22EC1023", "Rohan Gupta", "rohan@college.edu", "rohan.gupta@gmail.com"},
                {"22EC1024", "Ananya Reddy", "student@college.edu", "ananya.reddy@gmail.com"}
            };

            for (String[] d : demo) {
                UserAccount u = new UserAccount();
                u.setEmail(d[2]);
                u.setLoginId(d[0]);
                u.setPasswordHash(enc.encode("student123"));
                u.setRole(Role.STUDENT);
                users.save(u);

                Student s = new Student();
                s.setUser(u);
                s.setRollNo(d[0]);
                s.setFullName(d[1]);
                s.setPersonalEmail(d[3]);
                s.setPhone("+91 90000 10001");
                s.setGender("Not specified");
                s.setDepartment("Electronics & Communication Engineering");
                s.setCourse("B.Tech");
                s.setYearLabel("3rd Year");
                s.setSemester("5");
                s.setSection("ECE-A");
                students.save(s);

                Enrollment e = new Enrollment();
                e.setStudent(s);
                e.setCollegeClass(c);
                enrollments.save(e);
            }
        };
    }
}
