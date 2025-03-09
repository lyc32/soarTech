package com.codenext.backend.service.root.rootMailService;

import com.codenext.backend.config.I18nUtil;
import com.codenext.backend.entity.SmtpMail;
import com.codenext.backend.repository.SmtpMailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RootMailService
{
    @Autowired
    private SmtpMailRepository smtpMailRepository;

    public SmtpMail getMailConfig()
    {
        List<SmtpMail> smtpMailList = this.smtpMailRepository.findAll();

        if(smtpMailList != null && smtpMailList.size() > 0)
        {
            return smtpMailList.get(0);
        }

        return new SmtpMail();
    }

    @Transactional
    public String setMailConfig(SmtpMail smtpMail, String lang)
    {
        // format item fields:
        // remove front and end space;
        smtpMail.format();

        // check input item is correct or not
        // item must have: itemName, orderNumber, serialNumber, and storeHouse
        String check = smtpMail.check();
        if(check != null)
        {
            return I18nUtil.getMessage(check, lang);
        }

        this.smtpMailRepository.deleteAll();
        this.smtpMailRepository.save(smtpMail);

        return I18nUtil.getMessage("UPDATE_MAIL_SERVICE_SUCCESS", lang);
    }
}
