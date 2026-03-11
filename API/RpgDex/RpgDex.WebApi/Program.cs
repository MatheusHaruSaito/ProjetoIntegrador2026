using RpgDex.Aplication.Interfaces;
using RpgDex.Aplication.Mapping;
using RpgDex.Aplication.Services;
using RpgDex.Domain.Interfaces;
using RpgDex.Infrastructure.Data;
using RpgDex.Infrastructure.Services;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

var builder = WebApplication.CreateBuilder(args);
BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));
// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<ICharacterRepository, CharacterRepository>();
builder.Services.AddScoped<ICharacterSevice,CharacterService>();

MappingConfig.Configure();

builder.Services.AddCors(options => {
    options.AddPolicy("PermitirTudo", policy => {
        policy.AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
