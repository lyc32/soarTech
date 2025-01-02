package com.codenext.backend.repository;

import com.codenext.backend.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long>
{
    Optional<Account> findAccountEntityById(Long id);
    Optional<Account> findAccountEntityByAccountName(String accountName);
    Optional<Account> findAccountEntityByEmail(String email);
    List<Account>     findAccountEntityByRole(String role);

    @Query(value = "SELECT * FROM account WHERE if(?1 != '', account_name like %?1% OR first_name like %?1% OR last_name like %?1% OR middle_name like %?1%,1=1) " +
                                           "AND if(?2 != '', account_name like %?2% OR email like %?2%, 1=1) " +
                                           "AND if(?3 != 'all', role = ?3, 1=1) " +
                                           "AND if(?4 != 'all', state = ?4, 1=1) " +
                                           "ORDER BY id desc limit ?5,?6", nativeQuery = true)
    List<Account> searchAccountList(String name, String email, String role, String state, Long page, int row);

}
