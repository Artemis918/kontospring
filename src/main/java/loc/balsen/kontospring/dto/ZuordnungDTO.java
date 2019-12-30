package loc.balsen.kontospring.dto;

import loc.balsen.kontospring.data.SubCategory;
import loc.balsen.kontospring.data.Plan;
import loc.balsen.kontospring.data.Zuordnung;
import loc.balsen.kontospring.repositories.BuchungsBelegRepository;
import loc.balsen.kontospring.repositories.SubCategoryRepository;
import loc.balsen.kontospring.repositories.PlanRepository;
import lombok.Data;

@Data
public class ZuordnungDTO {

	int id;
	String detail;
	String description;
	int sollwert;
	int istwert;
	boolean committed;
	int plan;
	int beleg;
	int konto;
	int group;
	int position;
	
	public ZuordnungDTO() {}
	
	public ZuordnungDTO(Zuordnung z) {
		id = z.getId();
		detail = z.getShortdescription();
		istwert = z.getWert();
		beleg = z.getBuchungsbeleg().getId();
		committed = z.isCommitted();
		position = 2000;
		Plan p = z.getPlan();
		if (p != null) {
			plan = p.getId();
			sollwert = p.getWert();
			position = p.getPosition();
		}

		SubCategory k = z.getSubCategory();
		if (k != null) {
			group = k.getCategory().getId();
			konto = k.getId();
		}
	}

	public ZuordnungDTO(Plan p) {
		id = 0;
		detail = p.getShortDescription();
		sollwert = p.getWert();
		position = p.getPosition();
		istwert=0;
		beleg = 0;
		committed = false;
		plan=p.getId();
		SubCategory s = p.getSubCategory();
		group = s.getCategory().getId();
		konto = s.getId();
	}

	public Zuordnung toZuordnung(PlanRepository planRepository, SubCategoryRepository subCategoryRepository,
			BuchungsBelegRepository belegRepository) {
		Zuordnung res = new Zuordnung();
		res.setId(id);
		res.setShortdescription(detail);
		res.setDescription(description);
		res.setWert(istwert);
		res.setCommitted(committed);

		if (plan != 0)
			res.setPlan(planRepository.getOne(plan));

		if (beleg != 0)
			res.setBuchungsbeleg(belegRepository.getOne(beleg));

		if (konto != 0) 
			res.setSubCategory(subCategoryRepository.getOne(konto));
		return res;
	}
	
	public int compareKonto(ZuordnungDTO z) {
		int res = Long.compare(position, z.position);
		if (res != 0)
			return res;
		
		return Long.compare(id,z.id);
	}

	public int compareGroup(ZuordnungDTO z) {
		int res = Long.compare(konto, z.konto);
		if (res != 0)
			return res;

		res = Long.compare(position, z.position);
		if (res != 0)
			return res;
		
		return Long.compare(id,z.id);
	}
}
