package cz.xoleks00.pis.data;

import java.util.Date;
import java.util.List;

public class EventDTO {
    private long id;
    private String title;
    private String description;
    private Date start;
    private Date end;
    private EventColor color;
    private UserDTO creator;
    private List<UserDTO> attendees;

    public EventDTO(long id, String title, String description, Date start, Date end, EventColor color, UserDTO creator, List<UserDTO> attendees) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.start = start;
        this.end = end;
        this.color = color;
        this.creator = creator;
        this.attendees = attendees;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public EventColor getColor() {
        return color;
    }

    public void setColor(EventColor color) {
        this.color = color;
    }

    public UserDTO getCreator() {
        return creator;
    }

    public void setCreator(UserDTO creator) {
        this.creator = creator;
    }

    public List<UserDTO> getAttendees() {
        return attendees;
    }

    public void setAttendees(List<UserDTO> attendees) {
        this.attendees = attendees;
    }
}
