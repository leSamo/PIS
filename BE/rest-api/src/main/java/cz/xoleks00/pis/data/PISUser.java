package cz.xoleks00.pis.data;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import org.mindrot.jbcrypt.BCrypt;

import jakarta.json.bind.annotation.JsonbTransient;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

/**
 * User class.
 */
@Entity
@Table(name = "PISUser")
@NamedQueries({
        @NamedQuery(name = "PISUser.findAll", query = "SELECT p FROM PISUser p"),
        @NamedQuery(name = "PISUser.findByName", query = "SELECT p FROM PISUser p WHERE p.name = :name")
})
public class PISUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String name;
    @Column(nullable = false)
    private String password;
    private String username;
    private String email;
    private Set<String> managedUsers;
    private boolean isAdmin;
    @Column(name = "user_role")
    @Enumerated(EnumType.STRING)
    private UserRole userRole;
    @Temporal(TemporalType.DATE)
    // @JsonbDateFormat("yyyy-MM-dd z")
    private Date userCreated;
    @OneToMany(cascade = { CascadeType.ALL }, fetch = FetchType.EAGER, mappedBy = "creator", orphanRemoval = false)
    @JsonbTransient
    private Collection<Event> events;

    public PISUser() {
        events = new ArrayList<>();
        managedUsers = new HashSet<>();
    }

    public Collection<Event> getEvents() {
        return events;
    }

    /**
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the rc
     */
    public long getId() {
        return id;
    }

    /**
     * @param rc the rc to set
     */
    public void setId(long id) {
        this.id = id;
    }

    public Date getUserCreated() {
        return userCreated;
    }

    public void setUserCreated(Date userCreated) {
        this.userCreated = userCreated;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = BCrypt.hashpw(password, BCrypt.gensalt());
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public String toString() {
        return "PISUser: " + name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean isAdmin) {
        this.isAdmin = isAdmin;
    }

    public UserRole getUserRole() {
        return userRole;
    }

    public void setUserRole(UserRole userRole) {
        this.userRole = userRole;
    }

    public Set<String> getManagedUsers() {
        return managedUsers;
    }

    public void setManagedUsers(Collection<String> managedUsers) {
        this.managedUsers = new HashSet<>(managedUsers); // Create a new HashSet from the input collection
    }

}
