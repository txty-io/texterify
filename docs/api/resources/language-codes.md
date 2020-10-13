# Language codes

{% api-method method="get" host="https://texterify.com/api/v1/" path="language\_codes" %}
{% api-method-summary %}
Get language codes
{% endapi-method-summary %}

{% api-method-description %}

{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Cake successfully retrieved.
{% endapi-method-response-example-description %}

```
{
   "data": [
      {
         "id":"60189387-57cb-4865-a51b-b801aad917f0",
         "type":"language_code",
         "attributes": {
            "id":"60189387-57cb-4865-a51b-b801aad917f0",
            "name":"Afar",
            "code":"aa"
         }
      },
      ...
   ]
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

