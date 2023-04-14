/**
 * 
 */
package cz.xoleks00.pis.graphql;

import java.util.List;

import org.eclipse.microprofile.graphql.Description;
import org.eclipse.microprofile.graphql.GraphQLApi;
import org.eclipse.microprofile.graphql.GraphQLException;
import org.eclipse.microprofile.graphql.Mutation;
import org.eclipse.microprofile.graphql.Query;
import org.eclipse.microprofile.graphql.Source;

import cz.xoleks00.pis.data.Car;
import cz.xoleks00.pis.data.Person;
import cz.xoleks00.pis.service.CarManager;
import cz.xoleks00.pis.service.PersonManager;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;

/**
 * GraphQL API definition.
 * See http://localhost:9080/graphql-api/graphql/schema.graphql
 * 
 * @author burgetr
 */
@GraphQLApi
@RequestScoped
public class Api
{
	@Inject
	private PersonManager personMgr; 
	@Inject
	private CarManager carMgr; 

	@Query
	@Description("Gets the complete list of people")
	public List<Person> getPeople()
	{
		return personMgr.findAll();
	}
	
	@Query
	@Description("Gets the complete list of cars")
	public List<Car> getCars()
	{
		return carMgr.findAll();
	}
	
	@Query
	@Description("Gets a person by their ID")
	public Person getPersonById(long id)
	{
		return personMgr.find(id);
	}
	
	public Integer getCarCount(@Source Person p)
	{
		return p.getCars().size();
	}
	
	@Mutation
	@Description("Updates a person or creates a new one")
	public Person updatePerson(Person p)
	{
		Person newPerson = personMgr.save(p);
		return newPerson;
	}

	@Mutation
	@Description("Deletes a person")
	public Person deletePerson(long id) throws GraphQLException
	{
		Person p = personMgr.find(id);
		if (p != null)
			personMgr.remove(p);
		else
			throw new GraphQLException("No such person");
		return p;
	}

	@Mutation
	@Description("Adds a car to a person")
	public Person addCar(long personId, Car car) throws GraphQLException
	{
		Person p = personMgr.find(personId);
		if (p != null)
		{
			personMgr.addCar(p, car);
		}
		else
			throw new GraphQLException("No such person");
		return p;
	}

}
