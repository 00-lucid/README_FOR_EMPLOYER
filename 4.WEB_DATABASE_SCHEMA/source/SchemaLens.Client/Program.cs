using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Radzen;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

builder.Services.AddRadzenComponents();

builder.Services.AddAuthorizationCore();

await builder.Build().RunAsync();
