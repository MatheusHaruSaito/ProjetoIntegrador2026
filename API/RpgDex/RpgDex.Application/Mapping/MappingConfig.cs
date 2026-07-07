using Mapster;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using RpgDex.Application.Dto;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
namespace RpgDex.Application.Mapping
{
    public class MappingConfig
    {
        public static void Configure()
        {
            //Mapeamentos para Character podem ser adicionados aqui, se necessário
            TypeAdapterConfig<CreateCharacterRequest, Character>
                .NewConfig()
                .Ignore(dest => dest.Id)
                .Map(dest => dest.Properties, src => ConvertToBsonDocument(src.Properties));

            TypeAdapterConfig<Character, CharacterResponse>
                .NewConfig()
                .Map(dest => dest.Properties, src => ConvertToDictionary(src.Properties))
                    .Map(dest => dest.IconPath, src => string.IsNullOrEmpty(src.IconPath) 
                    ? null 
                    :$"http://localhost:8080/api/File/{src.IconPath}"); //Tirar isso quando Implementar o uso  do cloudflare r2 / Solução Temporaria para mostrar a imagem

            TypeAdapterConfig<UpdateCharacterRequest, Character>
                .NewConfig()
                .Map(dest => dest.Properties, src => ConvertToBsonDocument(src.Properties));


            //Mapeamentos para ApplicationUser podem ser adicionados aqui, se necessário
            if (!BsonClassMap.IsClassMapRegistered(typeof(ApplicationUser)))
            {
                BsonClassMap.RegisterClassMap<ApplicationUser>(cm =>
                {
                    cm.AutoMap();
                });
            }
            
            TypeAdapterConfig<CreateUserDTO, ApplicationUser>
                 .NewConfig()
                 .Ignore(dest => dest.PasswordHash)
                 .Map(dest => dest.UserName, src => src.UserName)
                 .Map(dest => dest.Email, src => src.Email);

            TypeAdapterConfig<ApplicationUser, UserResponse>
                 .NewConfig()
                 .Map(dest => dest.UserName, src => src.UserName)
                 .Map(dest => dest.Email, src => src.Email)
                 .Map(dest => dest.IconPath, src => string.IsNullOrEmpty(src.IconPath)
                 ? null
                 : $"http://localhost:8080/api/File/{src.IconPath}"); //Tirar isso quando Implementar o uso  do cloudflare r2 / Solução Temporaria para mostrar a imagem


            //Mapeamentos para Campaign podem ser adicionados aqui, se necessário
            TypeAdapterConfig<CreateCampaignRequest, Campaign>
                .NewConfig()
                .Ignore(dest => dest.Id);
            TypeAdapterConfig<Campaign, CampaignResponse>
                .NewConfig()
                .Map(dest => dest.Id, src => src.Id)
                .Map(dest => dest.Title, src => src.Title)
                .Map(dest => dest.Description, src => src.Description)
                .Map(dest => dest.MaxPlayers, src => src.MaxPlayers)
                .Map(dest => dest.PlayerIds, src => src.PlayerIds)
                .Map(dest => dest.CharacterIds, src => src.CharacterIds)
                .Map(dest => dest.CharacterRequests, src => src.CharacterRequests)
                .Map(dest => dest.IconPath, src => string.IsNullOrEmpty(src.IconPath)
                 ? null
                 : $"http://localhost:8080/api/File/{src.IconPath}");
        }


        // Metodos para converter Dictionary<string, object> em BsonDocument

        private static BsonDocument ConvertToBsonDocument(string source)
        {
            if (string.IsNullOrWhiteSpace(source))
            {
                return new BsonDocument();
            }

            try
            {
                return MongoDB.Bson.Serialization.BsonSerializer.Deserialize<BsonDocument>(source);
            }
            catch (Exception)
            {
                return new BsonDocument();
            }
        }
        private static Dictionary<string, object> ConvertToDictionary(BsonDocument source)
        {
            if (source is null || source.ElementCount == 0)
            {
                return new Dictionary<string, object>();
            }
            try
            {
                var dotNetValue = BsonTypeMapper.MapToDotNetValue(source);

                if (dotNetValue is Dictionary<string, object> dictionary)
                {
                    return dictionary;
                }

                if (dotNetValue is IDictionary<string, object> iDictionary)
                {
                    return new Dictionary<string, object>(iDictionary);
                }

                return new Dictionary<string, object>();
            }
            catch
            {
                return new Dictionary<string, object>();
            }
        }
    }
}
