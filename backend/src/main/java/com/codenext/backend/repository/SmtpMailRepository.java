package com.codenext.backend.repository;

import com.codenext.backend.entity.SmtpMail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmtpMailRepository extends JpaRepository<SmtpMail, Integer>
{
    List<SmtpMail> findAll();
}
