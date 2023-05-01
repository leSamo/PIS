package cz.xoleks00.pis.data;

import java.util.Date;
import java.util.List;

/**
 * Event DTO.
 */
public class EventDTO {
    private long id;
    private String name;
    private String description;
    private Date start;
    private Date end;
    private EventColor color;
    private UserDTO creator;
    private String place;
    private List<UserDTO> attendees;

    public EventDTO(long id, String name, String description, Date start, Date end, EventColor color, UserDTO creator,
            String place, List<UserDTO> attendees) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.start = start;
        this.end = end;
        this.color = color;
        this.creator = creator;
        this.place = place;
        this.attendees = attendees;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String title) {
        this.name = title;
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

    public void setPlace(String place) {
        this.place = place;
    }

    public String getPlace() {
        return place;
    }

    public List<UserDTO> getAttendees() {
        return attendees;
    }

    public void setAttendees(List<UserDTO> attendees) {
        this.attendees = attendees;
    }
}
