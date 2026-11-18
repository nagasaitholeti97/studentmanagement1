package com.sams.model;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;
@Entity @Table(name="calendar_events")
public class CalendarEvent {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false) private String title;
 @Column(nullable=false) private String type;
 @Column(nullable=false) private LocalDate startDate;
 @Column(nullable=false) private LocalDate endDate;
 public UUID getId(){return id;}
    public void setId(UUID id) { this.id = id; } public String getTitle(){return title;} public void setTitle(String v){title=v;}
 public String getType(){return type;} public void setType(String v){type=v;}
 public LocalDate getStartDate(){return startDate;} public void setStartDate(LocalDate v){startDate=v;}
 public LocalDate getEndDate(){return endDate;} public void setEndDate(LocalDate v){endDate=v;}
}