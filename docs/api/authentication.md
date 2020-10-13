# Authentication

For authentication API keys are used which can be created in your profile. These keys give full control over your account so make sure to keep them secure.

{% hint style="warning" %}
Never save those API keys inside your repositories or publish them in some other way on the internet. Make sure to keep them secure.
{% endhint %}

After you have created you API key you can try the following curl command if everything is working \(make sure to replace `<email>` with the email you use to log in and `<secret>` with the just created API key\):

```text
curl "https://texterify.com/api/v1/projects?email=<email>&api_secret=<secret>"
```

All API endpoints are authenticated.

