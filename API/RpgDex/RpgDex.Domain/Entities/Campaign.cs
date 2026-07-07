using MongoDB.Bson.Serialization.Attributes;
using RpgDex.Domain.Exceptions;
using RpgDex.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace RpgDex.Domain.Entities
{
    public class Campaign
    {
        [BsonElement("PlayerIds")]
        private List<Guid> _playerIds = new();

        [BsonElement("CharacterIds")]
        private List<Guid> _characterIds = new();

        [BsonElement("CharacterRequests")]
        private List<Guid> _characterRequests = new();

        public Guid Id{ get; set; }
        public string Title{ get; set; }
        public string? Description{ get; set; }
        public string? Password { get; set; }
        public int MaxPlayers { get; set; }
        public string? IconPath { get; set; }
        public bool IsActive { get; set; } = true;
        public Guid GameMasterId{ get; set; }
        public CampaignSettings? Settings { get; set; }

        [BsonIgnore]
        public IReadOnlyCollection<Guid> PlayerIds => _playerIds.AsReadOnly();
        [BsonIgnore]
        public IReadOnlyCollection<Guid> CharacterIds => _characterIds.AsReadOnly();
        [BsonIgnore]
        public IReadOnlyCollection<Guid> CharacterRequests => _characterRequests.AsReadOnly();

        public Campaign()
        {
            Settings = new CampaignSettings();
        }
        public void AddPlayer(Guid playerId, string password)
        {
            if (_playerIds.Contains(playerId))
                throw new DomainException("Player já está na campanha");

            if (_playerIds.Count >= MaxPlayers)
                throw new DomainException("Falha ao adicionar jogador à campanha / Capacidade maxima atingida");

            if(Password != password)
            {
                throw new DomainException("Senha inválida.");
            }

            _playerIds.Add(playerId);
        }
        public bool TryAddCharacter(Guid characterId)
        {
            if (_characterIds.Contains(characterId))
                throw new DomainException("Personagem já está na campanha.");

            if(Settings.RequireApprovalForCharacters)
            {
                if (_characterRequests.Contains(characterId))
                {
                    throw new DomainException("O Mestre esta avaliando sua solicitação.");
                }
                _characterRequests.Add(characterId);
                return false;
            }

            _characterIds.Add(characterId);
            return true;
        }

        public void UpdateSettings(CampaignSettings newSettings) => Settings = newSettings
            ?? throw new ArgumentNullException(nameof(newSettings));

        public void AcceptCharacter(Guid characterId)
        {
            if (!_characterRequests.Contains(characterId))
                throw new DomainException("Personagem não está na lista de solicitações.");
            _characterRequests.Remove(characterId);
            _characterIds.Add(characterId);
        }
        public void RejectCharacter(Guid characterId)
        {
            if (!_characterRequests.Contains(characterId))
                throw new DomainException("Personagem não está na lista de solicitações.");
            _characterRequests.Remove(characterId);
        }
    }
}
