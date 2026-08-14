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
        public DateTime NextSession { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
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
        public (string message, bool IsSuccess) TryAddPlayer(Guid playerId, string password)
        {
            if (_playerIds.Contains(playerId))
                return ("Player já está na campanha", false);

            if (_playerIds.Count >= MaxPlayers)
                return ("Falha ao adicionar jogador à campanha / Capacidade maxima atingida", false);

            if(Password != password)
            {
                return ("Senha inválida.", false);
            }

            _playerIds.Add(playerId);
            return ("Jogador adicionado à campanha.", true);
        }
        public (string message, bool IsSuccess) TryAddCharacter(Guid characterId)
        {
            if (_characterIds.Contains(characterId))
                return ("Personagem já está na campanha", false);

            if (Settings.RequireApprovalForCharacters)
            {
                if (_characterRequests.Contains(characterId))
                {
                    return ("Personagem já está aguardando aprovação.", false);
                }
                _characterRequests.Add(characterId);
                return ("Solicitação enviada para o Mestre da campanha.", true);
            }

            _characterIds.Add(characterId);
            return ("Personagem adicionado à campanha.", true);
        }

        public void Update(string title, string? description, int maxPlayers, DateTime nextSession)
        {
            Title = title;
            Description = description;
            MaxPlayers = maxPlayers;
            NextSession = nextSession;
        }
        public void UpdateSettings(CampaignSettings newSettings) => Settings = newSettings
            ?? throw new ArgumentNullException(nameof(newSettings));

        public (string message, bool IsSuccess) TryAcceptCharacter(Guid characterId)
        {
            if (!_characterRequests.Contains(characterId))
                return ("Personagem não está aguardando aprovação.", false);
            _characterRequests.Remove(characterId);
            _characterIds.Add(characterId);
            return ("Personagem aceito na campanha.", true);
        }
        public (string message, bool IsSuccess) TryRejectCharacter(Guid characterId)
        {
            if (!_characterRequests.Contains(characterId))
                return ("Personagem não está aguardando aprovação.", false);
            _characterRequests.Remove(characterId);
            return ("Solicitação de personagem rejeitada.", true);
        }
        public (string message, bool IsSuccess) TryRemovePlayer(Guid playerId)
        {
            if (!PlayerIds.Contains(playerId))
                return ("Jogador não está na campanha.", false);
            _playerIds.Remove(playerId);
            return ("Jogador removido da campanha.", true);
        }
    }
}
