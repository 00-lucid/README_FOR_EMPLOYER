using IV.Shared.Interfaces.Data;
using IV.Web.Components;
using IV.Shared.Interfaces.Services;
using IV.Shared.Model;
using IV.Web;
using IV.Web.Data;
using IV.Web.Hubs;
using IV.Web.Services;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// 바인딩: appsettings.json의 EmailService 섹션을 EmailServiceSettings로 바인딩
builder.Services.Configure<EmailServiceSettings>(
    builder.Configuration.GetSection("EmailService"));
// EmailServiceSettings를 직접 주입할 수 있도록 서비스로 등록
builder.Services.AddSingleton(resolver =>
    resolver.GetRequiredService<IOptions<EmailServiceSettings>>().Value);
// IEmailService에 EmailService 등록
builder.Services.AddTransient<IEmailService, EmailService>();


// Auth
builder.Services.AddScoped<CustomAuthenticationStateProvider>();
builder.Services.AddScoped<AuthenticationStateProvider>(sp => sp.GetRequiredService<CustomAuthenticationStateProvider>());

// Add Config Database
builder.Services.AddTransient<ILoginContext, LoginContext>();
builder.Services.AddTransient<IUserContext, UserContext>();
builder.Services.AddTransient<IAlbumContext, AlbumContext>();
builder.Services.AddTransient<IAlbumPhotoContext, AlbumPhotoContext>();
builder.Services.AddTransient<IAlbumStoryContext, AlbumStoryContext>();
builder.Services.AddTransient<IAlbumSubscriptionContext, AlbumSubscriptionContext>();
builder.Services.AddTransient<IFeedContext, FeedContext>();
builder.Services.AddTransient<IAlarmContext, AlarmContext>();
builder.Services.AddTransient<IAlbumShortContext, AlbumShortContext>();

// Add Service
builder.Services.AddTransient<ILoginService, LoginService>();
builder.Services.AddTransient<IUserService, UserService>();
builder.Services.AddTransient<IAlbumService, AlbumService>();
builder.Services.AddTransient<IAlbumPhotoService, AlbumPhotoService>();
builder.Services.AddTransient<IAlbumStoryService, AlbumStoryService>();
builder.Services.AddTransient<IAlbumSubscriptionService, AlbumSubscriptionService>();
builder.Services.AddTransient<IFeedService, FeedService>();
builder.Services.AddTransient<IAlarmService, AlarmService>();
builder.Services.AddTransient<IAzureService, AzureService>();
builder.Services.AddTransient<IAzureFaceAiService, AzureFaceAiService>();
builder.Services.AddTransient<IAlbumShortService, AlbumShortService>();
builder.Services.AddTransient<IAlbumMediaService, AlbumMediaService>();

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Add device-specific services used by the IV.Shared project
builder.Services.AddSingleton<IFormFactor, FormFactor>();

// Add Authentication and Authorization
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "Cookies"; // 기본 인증 스킴 설정
    options.DefaultChallengeScheme = "Cookies"; // 인증이 필요하거나 실패한 경우 동작
}).AddCookie("Cookies", options =>
{
    options.LoginPath = "/login"; // 인증되지 않은 사용자가 로그인 페이지로 리디렉션될 경로
    options.AccessDeniedPath = "/access-denied"; // 권한 부족 시 리디렉션 경로
});

builder.Services.AddAuthorization();


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

// Authentication/Authorization 미들웨어 추가
app.UseAuthentication();
app.UseAuthorization();


app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddAdditionalAssemblies(typeof(IV.Shared._Imports).Assembly);

// SignalR 허브 엔드포인트 설정
app.MapHub<AlarmHub>("/alarmhub");

app.Run();
