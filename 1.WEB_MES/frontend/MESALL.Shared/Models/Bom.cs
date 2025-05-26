using System.Text.Json.Serialization;
using MESALL.Shared.Enums;

namespace MESALL.Shared.Models;

// BOM 모델 클래스
public class Bom
{
    public int BomId { get; set; }
    public BomStatus BomStatus { get; set; } = BomStatus.Draft;
    public string BomVersion { get; set; } = "";
    public string Remark { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    public List<ItemBom> Items { get; set; } = new ();
    
    [JsonIgnore]
    public bool IsExpanded { get; set; } = false;
}

// BOM 품목 모델 클래스
public class ItemBom
{
    public int BomId { get; set; }
    public int ItemId { get; set; }
    public double Quantity { get; set; }
    public string? Remark { get; set; }
    public int? ParentItemId { get; set; }
    public Item? Item { get; set; }
    public Item? ParentItem { get; set; }
}

// BOM 품목 트리 모델 클래스
public class ItemBomTree
{
    public ItemBom ItemBom { get; set; } = new ();
    public List<ItemBomTree> Children { get; set; } = new ();
}

// BOM 생성 요청 모델
public class CreateBomRequest
{
    public BomStatus BomStatus { get; set; }
    public int BomVersion { get; set; }
    public string? Remark { get; set; }
    public List<AddItemToBomRequest> Items { get; set; } = new ();
}

// BOM 수정 요청 모델
public class UpdateBomRequest
{
    public BomStatus BomStatus { get; set; }
    public string BomVersion { get; set; } = "";
    public string? Remark { get; set; }
}

// BOM 품목 추가 요청 모델
public class AddItemToBomRequest
{
    public int ItemId { get; set; }
    public decimal Quantity { get; set; }
    public string? Remark { get; set; }
    public int? ParentItemId { get; set; }
}

// BOM 품목 수정 요청 모델
public class UpdateBomItemRequest
{
    public double Quantity { get; set; }
    public string? Remark { get; set; }
    public int? ParentItemId { get; set; }
}