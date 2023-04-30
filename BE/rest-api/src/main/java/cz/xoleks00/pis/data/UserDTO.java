package cz.xoleks00.pis.data;

import java.util.Date;
import java.util.Set;

public class UserDTO {
    private String username;
    private String name;
    private String email;
    private Date userCreated;
    private boolean admin;
    private UserRole userRole;
    private long id;
    private Set<String> managedUsers;

    public UserDTO(String username, String name, String email, Date userCreated, boolean admin, UserRole userRole, long id, Set<String> managedUsers) {
        this.username = username;
        this.name = name;
        this.email = email;
        this.userCreated = userCreated;
        this.admin = admin;
        this.userRole = userRole;
        this.id = id;
        this.managedUsers = managedUsers;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Date getUserCreated() {
        return userCreated;
    }

    public void setUserCreated(Date userCreated) {
        this.userCreated = userCreated;
    }

    public boolean isAdmin() {
        return admin;
    }

    public void setAdmin(boolean admin) {
        this.admin = admin;
    }

    public UserRole getUserRole() {
        return userRole;
    }

    public void setUserRole(UserRole userRole) {
        this.userRole = userRole;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Set<String> getManagedUsers() {
        return managedUsers;
    }

    public void setManagedUsers(Set<String> managedUsers) {
        this.managedUsers = managedUsers;
    }
    
}