import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.web.access.AccessDeniedHandler
import java.io.IOException

class CustomAccessDeniedHandler : AccessDeniedHandler {

    @Throws(IOException::class, ServletException::class)
    override fun handle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        accessDeniedException: AccessDeniedException
    ) {
        response.contentType = "application/json;charset=UTF-8"
        response.status = HttpServletResponse.SC_FORBIDDEN  // 403

        val errorJson = """
            {
                "success": false,
                "message": "해당 리소스에 접근할 권한이 없습니다.",
                "data": null
            }
        """.trimIndent()

        response.writer.write(errorJson)
    }
}