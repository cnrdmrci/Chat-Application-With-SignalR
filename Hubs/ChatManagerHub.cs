using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace ChatAppWithSignalR.Hubs
{
    public class ChatManagerHub : Hub
    {
        public static Dictionary<string, string> Users { get; set; } = new Dictionary<string, string>();

        public async Task SendMessageToUser(string conectionId, string message)
        {
            await Clients.Client(conectionId).SendAsync("NewMessageToUser", DateTime.Now, message);
        }

        public async Task SendMessageToGroup(string group, string message)
        {
            await Clients.Group(group).SendAsync("NewMessageToGroup", message);
        }

        public Task JoinGroup(string connectionId, string group)
        {
            return Groups.AddToGroupAsync(connectionId, group);
        }

        public async Task SendMessage(string message)
        {
            string username = Users[Context.ConnectionId];
            await Clients.All.SendAsync("NewMessage", DateTime.Now, username, message);
        }

        public async Task SetUsername(string username)
        {
            bool isTaken = Users.Any(p => p.Value == username);
            if (isTaken)
            {
                await Clients.Caller.SendAsync("InfoMessage", "Kullanıcı adı mevcut");
                Context.Abort();
                return;
            }
            Users[Context.ConnectionId] = username;
            await Clients.All.SendAsync("OnJoin", DateTime.Now, username, Users.Count,Users.Select(x=>x.Value).ToList());
        }

        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {

            bool connectionIdSaved = Users.Any(p => p.Key == Context.ConnectionId);
            if (!connectionIdSaved){return;}

            var username = Users[Context.ConnectionId];
            Users.Remove(Context.ConnectionId);
            await Clients.All.SendAsync("OnLeft", DateTime.Now, username, Users.Count, Users.Select(x => x.Value).ToList());
        }
    }
}
