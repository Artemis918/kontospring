package loc.balsen.kontospring.repositories;


import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import loc.balsen.kontospring.data.AccountRecord;

public interface AccountRecordRepository extends JpaRepository<AccountRecord, Integer> {

	public List<AccountRecord> findByValueAndCreatedAndSenderAndReceiver(int value, LocalDate created, String sender, String receiver);
	
	@Query(value = "select ar.* from account_record ar "
	               + "left join assignment a on a.accountrecord = ar.id "
	               + "where a.id is null "
	               + "order by ar.executed"
	       , nativeQuery = true)
	public List<AccountRecord> findUnresolvedRecords();

	@Query(value = "select ar.* from Account_Record ar "
            + "where ar.executed between ?1 and ?2 "
			+"and ar.type = ?3"
    , nativeQuery = true)
	public List<AccountRecord> findByTypeAndPeriod(LocalDate start, LocalDate end, Integer type);
	
}
