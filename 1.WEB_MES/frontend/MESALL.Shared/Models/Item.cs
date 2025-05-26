
using System;
using System.Text.Json.Serialization;
using MESALL.Shared.Enums;

namespace MESALL.Shared.Models
{
    /// <summary>
    /// 품목 정보를 담는 DTO 클래스
    /// </summary>
    public class Item
    {
        /// <summary>
        /// 품목 ID
        /// </summary>
        [JsonPropertyName("itemId")]
        public int ItemId { get; set; }
        
        /// <summary>
        /// 품목 이름
        /// </summary>
        [JsonPropertyName("itemName")]
        public string ItemName { get; set; } = string.Empty;
        
        /// <summary>
        /// 품목 타입 (완제품, 원자재 등)
        /// </summary>
        [JsonPropertyName("itemType")]
        public ItemType ItemType { get; set; }
        
        /// <summary>
        /// 단위 (EA, KG 등)
        /// </summary>
        [JsonPropertyName("unit")]
        public string Unit { get; set; } = string.Empty;
        
        /// <summary>
        /// 판매 가격
        /// </summary>
        [JsonPropertyName("salePrice")]
        public decimal SalePrice { get; set; }
        
        /// <summary>
        /// 생성 일시
        /// </summary>
        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// 수정 일시
        /// </summary>
        [JsonPropertyName("updatedAt")]
        public DateTime UpdatedAt { get; set; }
        
        /// <summary>
        /// 품목 사진 URI
        /// </summary>
        [JsonPropertyName("itemPhotoUri")]
        public string? ItemPhotoUri { get; set; }
        
        /// <summary>
        /// 회사 ID
        /// </summary>
        [JsonPropertyName("companyId")]
        public int CompanyId { get; set; }
    }

    /// <summary>
    /// 품목 생성 요청 DTO
    /// </summary>
    public class CreateItemRequest
    {
        /// <summary>
        /// 품목 이름
        /// </summary>
        [JsonPropertyName("itemName")]
        public string ItemName { get; set; } = string.Empty;
        
        /// <summary>
        /// 품목 타입 (완제품, 원자재 등)
        /// </summary>
        [JsonPropertyName("itemType")]
        public string ItemType { get; set; } = string.Empty;
        
        /// <summary>
        /// 단위 (EA, KG 등)
        /// </summary>
        [JsonPropertyName("unit")]
        public string Unit { get; set; } = string.Empty;
        
        /// <summary>
        /// 판매 가격
        /// </summary>
        [JsonPropertyName("salePrice")]
        public decimal SalePrice { get; set; }
        
        /// <summary>
        /// 품목 사진 URI
        /// </summary>
        [JsonPropertyName("itemPhotoUri")]
        public string? ItemPhotoUri { get; set; }
        
        /// <summary>
        /// 회사 ID
        /// </summary>
        [JsonPropertyName("companyId")]
        public int CompanyId { get; set; }
    }

    /// <summary>
    /// 품목 수정 요청 DTO
    /// </summary>
    public class UpdateItemRequest
    {
        /// <summary>
        /// 품목 이름
        /// </summary>
        [JsonPropertyName("itemName")]
        public string? ItemName { get; set; }
        
        /// <summary>
        /// 품목 타입 (완제품, 원자재 등)
        /// </summary>
        [JsonPropertyName("itemType")]
        public string? ItemType { get; set; }
        
        /// <summary>
        /// 단위 (EA, KG 등)
        /// </summary>
        [JsonPropertyName("unit")]
        public string? Unit { get; set; }
        
        /// <summary>
        /// 판매 가격
        /// </summary>
        [JsonPropertyName("salePrice")]
        public decimal? SalePrice { get; set; }
        
        /// <summary>
        /// 품목 사진 URI
        /// </summary>
        [JsonPropertyName("itemPhotoUri")]
        public string? ItemPhotoUri { get; set; }
    }
}