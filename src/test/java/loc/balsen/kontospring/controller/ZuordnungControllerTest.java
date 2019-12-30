package loc.balsen.kontospring.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertSame;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import loc.balsen.kontospring.data.BuchungsBeleg;
import loc.balsen.kontospring.data.SubCategory;
import loc.balsen.kontospring.data.Pattern;
import loc.balsen.kontospring.data.Plan;
import loc.balsen.kontospring.data.Template;
import loc.balsen.kontospring.data.Zuordnung;
import loc.balsen.kontospring.dataservice.TemplateService;
import loc.balsen.kontospring.dataservice.ZuordnungService;
import loc.balsen.kontospring.repositories.ZuordnungRepository;
import loc.balsen.kontospring.testutil.TestContext;

@RunWith(SpringRunner.class)
@AutoConfigureMockMvc
@WebAppConfiguration
public class ZuordnungControllerTest extends TestContext {

	@Autowired
	MockMvc mvc;

	@Mock
	private ZuordnungService mockZuordnungsService;

	@Mock
	private TemplateService mockTemplateService;
	
	@Mock
	private ZuordnungRepository mockZuordnungRepository;
	
	
	@Captor
	private ArgumentCaptor<List<BuchungsBeleg>> captor;
	
	@Before
	public void setup() {
		MockitoAnnotations.initMocks(this);
		createKontoData();
	}
	
	@After
	public void teardown() {
		clearRepos();
	}
	
	@Test
	public void testReplan() {
		BuchungsBeleg beleg =  new BuchungsBeleg();
		Plan plan = new Plan();
		Template template = new Template();
		
		Zuordnung zuordnung =  new Zuordnung();
		zuordnung.setId(1200);
		zuordnung.setBuchungsbeleg(beleg);


		when(mockZuordnungRepository.getOne(Integer.valueOf(100))).thenReturn(zuordnung);
		
		ZuordnungController controller =  new ZuordnungController(null, mockZuordnungRepository, mockZuordnungsService, 
				mockTemplateService, null, null);
		
		// do nothing
		controller.replan(100);
		
		zuordnung.setPlan(plan);
		controller.replan(100);
		
		plan.setTemplate(template);	
		controller.replan(100);

		verify(mockZuordnungRepository,times(1)).delete(zuordnung);
		verify(mockTemplateService,times(1)).saveTemplate(template);
		
		verify(mockZuordnungsService,times(1)).assign(captor.capture());
		
		assertSame(beleg, captor.getValue().get(0));

	}

	@Test
	public void testAssign() throws Exception {

		LocalDate today = LocalDate.now();
		int month = today.getMonthValue();
		int year = today.getYear();

		createBeleg("test1 blabla");
		createBeleg("test2 blabla");
		createBeleg("test3 bleble");
		createBeleg("test4 bleble");
		createPlan("1", subCategory1);
		createPlan("2", subCategory2);
		createPlan("3", subCategory5);

		mvc.perform(get("/assign/all")).andExpect(status().isOk());
		assertEquals(3, zuordnungRepository.findAll().size());

		mvc.perform(get("/assign/getKontoGroup/" + year + "/" + month + "/" + category1.getId()))
				.andExpect(status().isOk()).andExpect(jsonPath("$.[*]", hasSize(2)));

		mvc.perform(get("/assign/getKontoGroup/" + year + "/" + month + "/" + category2.getId()))
				.andExpect(status().isOk()).andExpect(jsonPath("$.[*]", hasSize(1)));

		mvc.perform(get("/assign/getKontoGroup/" + year + "/" + month + "/" + kontogruppe3.getId()))
				.andExpect(status().isOk()).andExpect(jsonPath("$.[*]", hasSize(0)));

		mvc.perform(get("/assign/getKonto/" + year + "/" + month + "/" + subCategory1.getId())).andExpect(status().isOk())
				.andExpect(jsonPath("$.[*]", hasSize(1)));

	}

	@Test
	public void testAssignKonto() throws Exception {
		
		BuchungsBeleg beleg2 = createBeleg("test5 bleble");
		BuchungsBeleg beleg1 =createBeleg("test6 bleble");
		
		String json = "{ \"text\": \"helpme\""
				    + ", \"konto\": " + subCategory4.getId() 
				    + ", \"ids\": [ " + beleg1.getId() +"," +beleg2.getId() + " ] }";
		
		mvc.perform(post("/assign/tokonto")
				.content(json)
				.contentType(MediaType.APPLICATION_JSON))
		        .andExpect(status().isOk());
		
		List<Zuordnung> assignList = zuordnungRepository.findByShortdescription("helpme");
		assertEquals(2, assignList.size());
	}
	
	private BuchungsBeleg createBeleg(String description) {
		BuchungsBeleg result = new BuchungsBeleg();
		result.setDetails(description);
		result.setWertstellung(LocalDate.now());
		result.setBeleg(LocalDate.now());
		buchungsbelegRepository.save(result);
		return result;
	}

	private Plan createPlan(String detailmatch, SubCategory subCategory) {
		Plan plan = new Plan();
		plan.setDescription("short: " + detailmatch);
		plan.setStartDate(LocalDate.now().minusDays(2));
		plan.setPlanDate(LocalDate.now());
		plan.setEndDate(LocalDate.now().plusDays(2));
		plan.setSubCategory(subCategory);
		plan.setPattern(new Pattern("{\"details\": \"" + detailmatch + "\"}"));
		planRepository.save(plan);
		return plan;
	}
}
