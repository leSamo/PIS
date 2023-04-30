package cz.xoleks00.pis.data;

import java.util.Date;
import java.util.List;

public class CreateEventRequest {
    private Date start;
    private Date end;
    private String name;
    private String description;
    private EventColor color;
    private List<String> attendees;

    public CreateEventRequest() {
    }

    public CreateEventRequest(Date start, Date end, String name, String description, EventColor color, List<String> attendees) {
        this.start = start;
        this.end = end;
        this.name = name;
        this.description = description;
        this.color = color;
        this.attendees = attendees;
    }

    public Date getStart() {
        return start;
    }

    public void setStart(Date start) {
        this.start = start;
    }

    public Date getEnd() {
        return end;
    }

    public void setEnd(Date end) {
        this.end = end;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public EventColor getColor() {
        return color;
    }

    public void setColor(EventColor color) {
        this.color = color;
    }

    public List<String> getAttendees() {
        return attendees;
    }

    public void setAttendees(List<String> attendees) {
        this.attendees = attendees;
    }
}