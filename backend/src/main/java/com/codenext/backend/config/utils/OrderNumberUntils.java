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
            result = result.substring(result.indexOf("productName\":") + 14, result.indexOf("imageData\":") - 3);
            webClient.close();

            if(result.equals(""))
            {
                List<String> list = new ArrayList<>();
                list.add(result);
                return list;
            }
            else
            {
                throw new Exception("item not found");
            }
        }
        catch (Exception exception)
        {
            return null;
        }
    }
}
