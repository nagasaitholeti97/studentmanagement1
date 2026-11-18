package com.sams.model;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name="college_classes")
public class CollegeClass {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false,unique=true) private String code;
 @Column(nullable=false) private String label;
 private Integer yearNumber;
 private String section, semester;
 public UUID getId(){return id;}
    public void setId(UUID id) { this.id = id; } public String getCode(){return code;} public void setCode(String v){code=v;}
 public String getLabel(){return label;} public void setLabel(String v){label=v;}
 public Integer getYearNumber(){return yearNumber;} public void setYearNumber(Integer v){yearNumber=v;}
 public String getSection(){return section;} public void setSection(String v){section=v;}
 public String getSemester(){return semester;} public void setSemester(String v){semester=v;}
}