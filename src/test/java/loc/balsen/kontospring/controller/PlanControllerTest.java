package loc.balsen.kontospring.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.Assert.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import loc.balsen.kontospring.data.Konto;
import loc.balsen.kontospring.data.Kontogruppe;
import loc.balsen.kontospring.data.Pattern;
import loc.balsen.kontospring.data.Plan;
import loc.balsen.kontospring.data.Template;
import loc.balsen.kontospring.data.Template.Rythmus;
import loc.balsen.kontospring.data.Plan.MatchStyle;
import loc.balsen.kontospring.dto.PatternDTO;
import loc.balsen.kontospring.testutil.TestContext;

@RunWith(SpringRunner.class)
@AutoConfigureMockMvc
@WebAppConfiguration
public class PlanControllerTest extends TestContext {

	static private String planjson = "{  " +
			"\"id\": \"1234\", " +
			"\"creationdate\": \"2018-12-03\", " +
			"\"startdate\": \"2018-10-03\", " +
			"\"plandate\": \"2018-10-03\", " +
			"\"enddate\": \"2018-10-03\", " +
			"\"idkonto\": 1, " +
			"\"description\": \"Beschreibung\", " +
			"\"shortdescription\": \"Kurz\", " +
			"\"position\": 5, " +
			"\"wert\": 100, " +
			"\"matchstyle\": 1, " +
			"\"patterndto\": { " +
            "  \"sender\": \"Absender\", " +
			"  \"receiver\": \"Empfänger\", " +
            "  \"referenceID\": \"Referenz\", " +
			"  \"details\": \"*pups*\", " +
            "  \"mandat\":  \"\" " +
			"}" +
			"}";
		
	@Autowired
	MockMvc mvc;

	private Konto konto;

	private Template template;

	@Test
	public void testSaveAndList() throws Exception {
		createKontoData();
		mvc.perform(post("/plans/save").content(planjson).contentType(MediaType.APPLICATION_JSON)).andExpect(status().isOk());
		
		List<Plan> plans =planRepository.findAll();
		assertEquals(1,plans.size());
		Plan plan  = plans.get(0);
		assertEquals(100, plan.getWert());
		assertEquals(1, plan.getKonto().getId());
		
		mvc.perform(get("/plans/list"))
		   .andExpect(jsonPath("$.[*]", hasSize(1)))
		   .andExpect(jsonPath("$.[0].shortdescription").value("Kurz"));
		
		mvc.perform(get("/plans/delete/" + plan.getId()))
		   .andExpect(status().isOk());

		plan =planRepository.findById(plan.getId()).get();
		assertNotNull(plan.getDeactivateDate());
	
	}
	
	private void createKontoData() {
		Kontogruppe kg1 =  new Kontogruppe();
		kg1.setShortdescription("KontoG1");
		kontogruppeRepository.save(kg1);
		
		konto = new Konto();
		konto.setShortdescription("k1shortDesc");
		konto.setKontoGruppe(kg1);
		
		kontoRepository.save(konto);
	}
	
	@Test
	public void testCreateFromTemplate() throws Exception {
		int year = LocalDate.now().getYear() +1 ;
		createKontoData();
		createTemplate(year);

		mvc.perform(get("/plans/createFromTemplate/11/" + year))
		   .andExpect(status().isOk());
		
		List<Plan> plans = planRepository.findByTemplate(template);
		assertEquals(3,plans.size());
	}
	
	
	private void createTemplate(int year) {
		template =  new Template();
		template.setGueltigVon(LocalDate.of(year,9, 1));
		template.setGueltigBis(LocalDate.of(year,12, 31));
		template.setStart(LocalDate.of(year,9, 15));
		template.setVardays(5);
		template.setAnzahlRythmus(1);
		template.setRythmus(Rythmus.MONTH);
		template.setKonto(konto);
		template.setDescription("Beschreibung");
		template.setShortDescription("Kurz");
		template.setWert(100);
		template.setPosition(4);
		template.setMatchStyle(MatchStyle.EXACT);
		template.setPattern(new Pattern( "  \"sender\": \"Absender\", " +
			"  \"receiver\": \"Empfänger\", " +
            "  \"referenceID\": \"Referenz\", " +
			"  \"details\": \"*pups*\", " +
            "  \"mandat\":  \"\" "));	
		templateRepository.save(template);
	}
	
}