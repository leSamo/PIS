package cz.xoleks00.pis.data;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Car")
public class Car
{
    @Id
    private String reg;
	private String prod;
	private String type;
	
	@ManyToOne(fetch=FetchType.EAGER)
    private PISUser owner;
	
	public Car()
	{
	}
	
    public String getProd()
    {
        return prod;
    }
    
    public boolean equals(Object other)
    {
        if (other instanceof Car)
            return ((Car) other).getReg().equals(reg);
        else
            return false;
    }
    
    public void setProd(String prod)
    {
        this.prod = prod;
    }
    
    public String getType()
    {
        return type;
    }
    
    public void setType(String type)
    {
        this.type = type;
    }
    
    public String getReg()
    {
        return reg;
    }
    
    public void setReg(String reg)
    {
        this.reg = reg;
    }

    public PISUser getOwner()
    {
        return owner;
    }

    public void setOwner(PISUser owner)
    {
        this.owner = owner;
    }
}
