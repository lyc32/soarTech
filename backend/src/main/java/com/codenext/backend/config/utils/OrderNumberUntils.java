package com.codenext.backend.config.utils;

import com.gargoylesoftware.htmlunit.WebClient;
import com.gargoylesoftware.htmlunit.html.HtmlPage;

import java.util.ArrayList;
import java.util.List;

public class OrderNumberUntils // TODO
{
    public List<String> getProductName(WebClient webClient, String url)
    {
        try
        {
            String result = "";
            webClient.getOptions().setCssEnabled(false);
            webClient.getOptions().setJavaScriptEnabled(false);
            webClient.getOptions().setDownloadImages(false);
            webClient.getOptions().setPrintContentOnFailingStatusCode(false);
            final HtmlPage page = webClient.getPage(url);
            result = page.asXml();
            webClient.close();

            List<String> list = new ArrayList<>();
            while(result.indexOf("productName\":") > 0)
            {
                String item = result.substring(result.indexOf("productName\":") + 14, result.indexOf("imageData\":") - 3);
                result = result.substring(result.indexOf("imageData\":") + 10, result.length()-1);
                list.add(item);
            }
            return list;
        }
        catch (Exception exception)
        {
            return null;
        }
    }
}
