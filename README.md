# Chat Uygulaması

### Amaç
Amacımız bir .net core mvc projesinde SignalR kütüphanesini kullanarak, real time bir konuşma uygulaması yapmak ve web socketin nasıl kullanıldığı vb durumları incelemek.

### Programın Tanıtımı Ve Kullanımı


### SignalR nedir?
SignalR gerçek zamanlı uygulamalar geliştirmek için hazırlanmış açık kaynaklı bir .net kütüphanesidir. Normal Http protokolünü kullanan sayfalarda güncel verilerin görüntülenebilmesi için sayfanın yenilenmesi gereklidir. Ancak SignalR kütüphanesinin devamlı bağlantı kurabilmesi nedeniyle anlık değişiklikler sayfa yenilenmeden görüntülenebilmektedir.

### SignalR .net core Entegrasyon
SignalR Kütüphanesini .net core projenize, StartUp.cs içerisine aşağıdaki gibi ekleyebilir ve Hub sınıfını da belirtebilirsiniz.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddSignalR();
}

public void Configure(IApplicationBuilder app)
{
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapHub<ChatManagerHub>("/chatManagerHub");
    });
}
```

### SignalR Hub Sunucu İşlemleri
SignalR kütüphanesinin Hub sınıfını kalıtım alan bir sınıf ve bu sınıf içerisinde ilgili methodlar tanımlanmaktadır.
```csharp
public class ChatManagerHub : Hub
{
		public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
        	return base.OnDisconnectedAsync();
        }

        public async Task SendMessage(string message)
        {
            await Clients.All.SendAsync("NewMessage", message);
        }
}
```
SendMessage methodu ile tüm istemcilerin NewMessage metoduna ilgili parametreler ile birlikte çağırım işlemi yapılmaktadır.

### SignalR İstemci Entegrasyonu
Öncelikle javascript kısmına Signalr kütüphanesini eklemeliyiz.\
Ardından sunucu bağlantı nesnesini oluşturuyoruz.

```javascript
var connection = new signalR.HubConnectionBuilder().withUrl("/chatManagerHub").build();
```


Ve bağlantı nesnesi ile birlikte sunucu bağlantısı kurulur.

```javascript
connection.start()
.then(function(){console.log("Sunucu bağlantısı kuruldu.");})
.catch(function (error) {console.log("Hata! Detay:" + error);});
``` 

Sunucu kısmında ChatManagerHub sınıfında çağırılmak üzere belirttiğimiz NewMessage methodunu aşağıda tanımladık.

```javascript
connection.on('NesMessage',function(message){
		alert('message');
	})
```

İstemci kısmından sunucudaki bir methodu çağırmak için ise aşağıdaki gibi bir tanımlama yapılmakta.

```javascript
connecetion.invoke('SendMessage','Merhaba Dünya!');
```