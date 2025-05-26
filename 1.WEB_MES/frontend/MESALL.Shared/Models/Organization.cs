using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace MESALL.Shared.Models
{
    public class Organization
    {
        public int OrganizationId { get; set; }
        public string OrganizationName { get; set; }
        public string Description { get; set; }
        public int CompanyId { get; set; }
        public int? ParentOrganizationId { get; set; }
        
        [JsonIgnore]
        public bool IsRoot => ParentOrganizationId == null;
        
        [JsonIgnore]
        public List<Organization> Children { get; set; } = new List<Organization>();
        
        public List<User> Users { get; set; } = new List<User>();
        
        [JsonIgnore]
        public bool IsDeleting { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }

    public class CreateOrganizationRequest
    {
        public string OrganizationName { get; set; }
        public int CompanyId { get; set; }
        public int[] UserIds { get; set; } = Array.Empty<int>();
        public int? ParentOrganizationId { get; set; }
    }

    public class UpdateOrganizationRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int? ParentOrganizationId { get; set; }
    }
}