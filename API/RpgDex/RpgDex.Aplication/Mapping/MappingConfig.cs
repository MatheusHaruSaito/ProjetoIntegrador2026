using Mapster;
using RpgDex.Aplication.Dto;
using RpgDex.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Aplication.Mapping
{
    public class MappingConfig
    {
        public static void Configure()
        {
            TypeAdapterConfig<CreateCharacterRequest, Character>
                .NewConfig()
                .Ignore(dest => dest.Id)
                .Map(dest => dest.IconPath, src => "default_icon.png");
                
        }
    }
}
