using RpgDex.Application.Interfaces;
using RpgDex.Application.Mapping;
using RpgDex.Application.Services;
using RpgDex.Domain.Interfaces;
using RpgDex.Infrastructure.Data;
using RpgDex.Infrastructure.Services;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using RpgDex.Domain.Entities;
using AspNetCore.Identity.MongoDbCore.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using RpgDex.Infrastructure.Repositories;
using MongoDB.Driver;
using MongoDB.Driver.GridFS;
using RpgDex.Infrastructure.Settings;

var builder = WebApplication.CreateBuilder(args);
BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));

// Add services to the container.

builder.Services.AddSingleton<MongoDbContext>();

builder.Services.AddScoped<IMongoDatabase>(sp =>
{
    var context = sp.GetRequiredService<MongoDbContext>();
    return context.GetDatabase();
});

builder.Services.AddScoped<IGridFSBucket>(sp =>
{
    var database = sp.GetRequiredService<IMongoDatabase>();
    return new GridFSBucket(database);
});

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<ICharacterRepository, CharacterRepository>();
builder.Services.AddScoped<ICharacterSevice,CharacterService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService,TokenService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ITokenRepository,TokenRepository>();
builder.Services.AddScoped<IUserService,UserService>();
builder.Services.AddScoped<IFileRepository, FileRepository>();
builder.Services.AddScoped<IFileService, FileService>();
builder.Services.AddScoped<ICampaignRepository, CampaignRepository>();
builder.Services.AddScoped<ICampaignService, CampaignService>();

builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
//builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
    ?? throw new InvalidOperationException("Jwt Settings Not Found");
MappingConfig.Configure();



builder.Services.AddCors(options => {
    options.AddPolicy("PermitirTudo", policy => {
        policy.AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

builder.Services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;

    options.User.RequireUniqueEmail = true;
})
    .AddMongoDbStores<ApplicationUser, ApplicationRole, Guid>
    (
        builder.Configuration.GetConnectionString("MongoDbConnection"),
        builder.Configuration["ConnectionStrings:DatabaseName"]
    ). AddDefaultTokenProviders()
    .AddRoles<ApplicationRole>();

var jwtKey = builder.Configuration["Jwt:Key"] 
    ?? throw new InvalidOperationException("Jwt Not Found");

builder.Services.AddAuthentication(option =>
{
    option.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    option.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero,
            NameClaimType = JwtRegisteredClaimNames.UniqueName
        };
    });



var app = builder.Build();

app.UseCors("PermitirTudo");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();  

app.MapControllers();

app.Run();
