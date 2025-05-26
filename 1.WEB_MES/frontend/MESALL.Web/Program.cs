using MESALL.Shared;
using MESALL.Shared.Interfaces;
using MESALL.Web;
using MESALL.Web.Components;
using MESALL.Web.Services;
using Microsoft.AspNetCore.Components.Authorization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient("MESALLApi", client =>
{
    client.BaseAddress = new Uri("http://localhost:8080/api/v1");
    // 필요한 경우 기본 헤더 설정
    // client.DefaultRequestHeaders.Add("HeaderName", "HeaderValue");
});

// builder.Services.AddAuthorizationCore();

// 분산 캐시 서비스 등록 (Redis 또는 SQL Server 캐시 등으로 확장 가능)
builder.Services.AddDistributedMemoryCache(); // 개발 환경은 메모리 캐시

builder.Services.AddScoped<CustomAuthenticationStateProvider>();
builder.Services.AddScoped<AuthenticationStateProvider>(sp => sp.GetRequiredService<CustomAuthenticationStateProvider>());

// Services
builder.Services.AddTransient<ILoginService, LoginService>();
builder.Services.AddTransient<IItemService, ItemService>();
builder.Services.AddTransient<IOrganizationService, OrganizationService>();
builder.Services.AddTransient<ICorrespondentService, CorrespondentService>();
builder.Services.AddTransient<IBomService, BomService>();

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddAdditionalAssemblies(typeof(MESALL.Shared._Imports).Assembly);

app.Run();