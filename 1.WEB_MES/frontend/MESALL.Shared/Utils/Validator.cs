using System;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace MESALL.Shared.utils;

public static class Validator
{
    /// <summary>
    /// 이메일 유효성 검사
    /// </summary>
    /// <param name="email">검사할 이메일</param>
    /// <returns>오류 메시지 또는 유효할 경우 null</returns>
    public static string? ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return "이메일을 입력해주세요.";
    
        // 기본 이메일 형식 검사 (문자@문자.문자)
        if (!email.Contains('@') || !email.Contains('.') || email.IndexOf('@') > email.LastIndexOf('.'))
            return "올바른 이메일 형식이 아닙니다.";
    
        // 더 정확한 이메일 검증 (System.ComponentModel.DataAnnotations 사용)
        if (!new EmailAddressAttribute().IsValid(email))
            return "유효한 이메일 주소를 입력해주세요.";
    
        // 도메인 부분 검사
        string domain = email.Substring(email.IndexOf('@') + 1);
        if (domain.Length < 3 || !domain.Contains('.'))
            return "유효한 이메일 도메인이 아닙니다.";
    
        // 길이 제한
        if (email.Length > 100)
            return "이메일 주소가 너무 깁니다 (100자 이하).";
    
        return null; // 유효성 검사 통과
    }
    
    /// <summary>
    /// 비밀번호 유효성 검사
    /// </summary>
    /// <param name="password">검사할 비밀번호</param>
    /// <returns>오류 메시지 또는 유효할 경우 null</returns>
    public static string? ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return "비밀번호를 입력해주세요.";
            
        if (password.Length < 8)
            return "8자 이상 입력해주세요.";
            
        if (!password.Any(char.IsUpper))
            return "대문자를 포함해주세요.";
            
        if (!password.Any(c => "@#!$%&".Contains(c)))
            return "특수문자(@#!$%&)를 포함해주세요.";
            
        return null; // 유효성 검사 통과
    }
    
    /// <summary>
    /// 사용자 이름 유효성 검사
    /// </summary>
    /// <param name="username">검사할 사용자 이름</param>
    /// <returns>오류 메시지 또는 유효할 경우 null</returns>
    public static string? ValidateUsername(string username)
    {
        if (string.IsNullOrEmpty(username))
            return "사용자 이름을 입력해주세요.";
            
        if (username.Length < 3)
            return "사용자 이름은 3자 이상이어야 합니다.";
            
        if (username.Any(char.IsWhiteSpace))
            return "사용자 이름에 공백을 포함할 수 없습니다.";
            
        // 알파벳과 숫자만 허용 (특수문자 검사)
        if (!Regex.IsMatch(username, "^[a-zA-Z0-9가-힣]+$"))
            return "사용자 이름은 알파벳, 숫자, 한글만 포함할 수 있습니다.";
            
        return null; // 유효성 검사 통과
    }
    
    /// <summary>
    /// 비밀번호 확인 유효성 검사
    /// </summary>
    /// <param name="confirmPassword">확인용 비밀번호</param>
    /// <param name="originalPassword">원래 비밀번호</param>
    /// <returns>오류 메시지 또는 유효할 경우 null</returns>
    public static string? ValidateConfirmPassword(string confirmPassword, string originalPassword)
    {
        if (string.IsNullOrWhiteSpace(confirmPassword))
            return "비밀번호 확인을 입력해주세요.";
            
        // 비밀번호 자체의 유효성 검사 (길이, 특수문자 등)
        string? passwordCheck = ValidatePassword(confirmPassword);
        if (passwordCheck != null)
            return passwordCheck;
            
        // 비밀번호 일치 여부 검사
        if (confirmPassword != originalPassword)
            return "비밀번호가 일치하지 않습니다.";
            
        return null; // 유효성 검사 통과
    }
    
    /// <summary>
    /// 인증 코드 유효성 검사
    /// </summary>
    /// <param name="code">검사할 인증 코드</param>
    /// <returns>오류 메시지 또는 유효할 경우 null</returns>
    public static string? ValidateVerificationCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            return "인증 코드를 입력해주세요.";
            
        if (code.Length != 4)
            return "인증 코드는 4자리여야 합니다.";
            
        // 숫자만 포함되어 있는지 확인
        if (!code.All(char.IsDigit))
            return "인증 코드는 숫자만 포함해야 합니다.";
            
        return null; // 유효성 검사 통과
    }
    
    /// <summary>
    /// 사업자번호 유효성 검사
    /// </summary>
    /// <param name="number">검사할 사업자번호</param>
    /// <returns>오류 메시지 또는 유효할 경우 null</returns>
    public static string? ValidateBusinessNumber(string number)
    {
        // 숫자와 하이픈만 허용, 하이픈 제거 후 10자리 숫자여야 함
        if (string.IsNullOrWhiteSpace(number))
            return "사업자번호를 입력해주세요.";
    
        // 하이픈 제거
        string digitsOnly = new string(number.Where(c => char.IsDigit(c)).ToArray());
    
        // 10자리 확인
        if (digitsOnly.Length != 10)
            return "사업자번호는 10자리 숫자여야 합니다.";
    
        // 유효성 검증 알고리즘 (한국 사업자번호 검증 로직)
        try 
        {
            // 가중치 배열: [1, 3, 7, 1, 3, 7, 1, 3, 5]
            int[] weights = { 1, 3, 7, 1, 3, 7, 1, 3, 5 };
            int sum = 0;
        
            // 9자리까지 가중치를 곱하여 합산
            for (int i = 0; i < 9; i++)
            {
                sum += (digitsOnly[i] - '0') * weights[i];
            }
        
            // 체크섬 계산
            int checksum = 10 - (sum % 10);
            if (checksum == 10) checksum = 0;
        
            // 마지막 자리와 체크섬 비교
            if (checksum != (digitsOnly[9] - '0'))
                return "유효하지 않은 사업자번호입니다.";
        }
        catch (Exception)
        {
            return "사업자번호 형식이 올바르지 않습니다.";
        }
    
        return null; // 유효성 검사 통과
    }
}