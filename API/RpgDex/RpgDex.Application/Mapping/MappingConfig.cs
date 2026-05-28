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
            TypeAdapterConfig<CreateCharacterRequest, Character>
                .NewConfig()
                .Ignore(dest => dest.Id)
                .Map(dest => dest.Properties, src => ConvertToBsonDocument(src.Properties));

            TypeAdapterConfig<Character, CharacterResponse>
                .NewConfig()
                .Map(dest => dest.Properties, src => ConvertToDictionary(src.Properties));

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
        }
        private static BsonDocument ConvertToBsonDocument(Dictionary<string, JsonElement> source)
        {
            if (source is null || source.Count == 0)
            {
                return new BsonDocument();

            }

            try
            {
                var json = JsonSerializer.Serialize(source);
                return BsonSerializer.Deserialize<BsonDocument>(json);
            }
            catch (Exception ex)
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
