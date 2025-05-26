using Microsoft.Extensions.Logging;
using IV.Shared.Interfaces;
using IV.Services;
using IV.Shared.Interfaces.Services;
using MauiBlazorWeb.Shared;

namespace IV;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        InteractiveRenderSettings.ConfigureBlazorHybridRenderModes();

        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            });
        
        // Add device-specific services used by the IV.Shared project
        builder.Services.AddSingleton<IFormFactor, FormFactor>();

        builder.Services.AddMauiBlazorWebView();

#if DEBUG
        builder.Services.AddBlazorWebViewDeveloperTools();
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}
