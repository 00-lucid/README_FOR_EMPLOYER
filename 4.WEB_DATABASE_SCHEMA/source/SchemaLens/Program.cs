using Microsoft.AspNetCore.Components.Authorization;
using Radzen;
using SchemaLens;
using SchemaLens.Client.Interfaces;
using SchemaLens.Components;
using SchemaLens.Services;
using _Imports = SchemaLens.Client._Imports;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents()
    .AddInteractiveWebAssemblyComponents();

// Service
builder.Services.AddTransient<ISchemaService, SchemaService>();
builder.Services.AddTransient<IDatabaseService, DatabaseService>();
builder.Services.AddTransient<IKeywordService, KeywordService>();
builder.Services.AddTransient<ICommentService, CommentService>();
builder.Services.AddTransient<ISectionService, SectionService>();
builder.Services.AddTransient<IEncyclopediaService, EncyclopediaService>();
builder.Services.AddTransient<IAuthenticationService, AuthenticationService>();
builder.Services.AddTransient<IPeerService, PeerService>();
builder.Services.AddTransient<ISearchLogService, SearchLogService>();
builder.Services.AddTransient<IPeersGroupService, PeersGroupService>();
builder.Services.AddTransient<IPeersGroupMappingService, PeersGroupMappingService>();
builder.Services.AddTransient<IProjectService, ProjectService>();

// Register the Radzen services
builder.Services.AddRadzenComponents();
builder.Services.AddTransient<CookieThemeService, CookieThemeService>();

// Auth
builder.Services.AddAuthorization();
builder.Services.AddCascadingAuthenticationState();
builder.Services.AddScoped<CustomAuthenticationStateProvider>();
builder.Services.AddScoped<AuthenticationStateProvider>(sp => sp.GetRequiredService<CustomAuthenticationStateProvider>());

// Database
builder.Services.AddTransient<IDatabaseAccesser, DatabaseAccesser>();

// Radzen Cookie for Persist Theme
builder.Services.AddRadzenCookieThemeService(options =>
{
    options.Name = "MyApplicationTheme"; // The name of the cookie
    options.Duration = TimeSpan.FromDays(365); // The duration of the cookie
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseWebAssemblyDebugging();
}
else
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();


app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddInteractiveWebAssemblyRenderMode()
    .AddAdditionalAssemblies(typeof(_Imports).Assembly);

app.Run();
