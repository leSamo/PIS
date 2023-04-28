package cz.xoleks00.pis.data;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;

import jakarta.json.bind.annotation.JsonbTransient;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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


@Entity
@Table(name = "Person")
@NamedQueries({
    @NamedQuery(name="Person.findAll", query="SELECT p FROM Person p"),
    @NamedQuery(name="Person.findByName",
                query="SELECT p FROM Person p WHERE p.name = :name")
})
public class Person
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
	private String name;
    private String surname;
    @Column(nullable = false)
    private String password;
    private String username;
    @Temporal(TemporalType.DATE)
    //@JsonbDateFormat("yyyy-MM-dd z")
    private Date born;
    @OneToMany(cascade = { CascadeType.ALL }, fetch = FetchType.EAGER, mappedBy = "owner", orphanRemoval = true)
    @JsonbTransient
	private Collection<Car> cars;
    @OneToMany(cascade = { CascadeType.ALL }, fetch = FetchType.EAGER, mappedBy = "creator", orphanRemoval = false)
    @JsonbTransient
	private Collection<Event> events;
    
    public Person()
    {
        cars = new ArrayList<>();
        events = new ArrayList<>();
    }
    
    public Collection<Event> getEvents()
    {
        return events;
    }

    public Collection<Car> getCars()
    {
        return cars;
    }

    public void setCars(Collection<Car> cars)
    {
        this.cars = cars;
    }

    /**
     * @return the name
     */
    public String getName()
    {
        return name;
    }
    
    /**
     * @param name the name to set
     */
    public void setName(String name)
    {
        this.name = name;
    }
    
    /**
     * @return the surname
     */
    public String getSurname()
    {
        return surname;
    }
    
    /**
     * @param surname the surname to set
     */
    public void setSurname(String surname)
    {
        this.surname = surname;
    }
    
    /**
     * @return the rc
     */
    public long getId()
    {
        return id;
    }
    
    /**
     * @param rc the rc to set
     */
    public void setId(long id)
    {
        this.id = id;
    }
    
    /**
     * @return the born
     */
    public Date getBorn()
    {
        return born;
    }
    
    /**
     * @param born the born to set
     */
    public void setBorn(Date born)
    {
        this.born = born;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    
    @Override
    public String toString()
    {
        return "Person: " + name + " " + surname + "(" + cars.size() + " cars)";
    }
    
}
