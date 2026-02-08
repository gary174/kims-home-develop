/**
 * KIMS Home Develop - Contact Form Handler (Professional Notification Version)
 */

function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        var data = JSON.parse(e.postData.contents);
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        if (sheet.getLastRow() === 0) {
            sheet.appendRow(['Timestamp', 'Name', 'Email', 'Phone', 'Interest', 'City', 'ZIP', 'Timeline', 'Budget', 'Notes', 'Source']);
        }

        sheet.appendRow([
            new Date(),
            data.name || "N/A",
            data.email || "N/A",
            data.phone || "N/A",
            data.interest || "N/A",
            data.city || "N/A",
            data.zip || "N/A",
            data.timeline || "N/A",
            data.budget || "N/A",
            data.notes || "N/A",
            data.source || "Website"
        ]);

        sendNotificationEmail(data);

        return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}

function sendNotificationEmail(data) {
    var recipient = "sales@kimshomedevelope.com";
    var customerName = data.name || "고객";
    var subject = "새로운 리드 접수: " + customerName;

    var body = "KIMS Home Develop 홈페이지에서 새로운 문의가 들어왔습니다.\n\n" +
        "--- 고객 정보 ---\n" +
        "이름: " + customerName + "\n" +
        "이메일: " + (data.email || "N/A") + "\n" +
        "전화번호: " + (data.phone || "N/A") + "\n\n" +
        "--- 프로젝트 정보 ---\n" +
        "관심분야: " + (data.interest || "N/A") + "\n" +
        "지역: " + (data.city || "N/A") + " (ZIP: " + (data.zip || "N/A") + ")\n" +
        "희망시기: " + (data.timeline || "N/A") + "\n" +
        "예산범위: " + (data.budget || "N/A") + "\n\n" +
        "--- 상세 내용 ---\n" +
        (data.notes || "특이사항 없음") + "\n\n" +
        "출처: " + (data.source || "홈페이지 양식");

    try {
        // 옵션 추가: 보내는 사람 이름(name)과 답장 주소(replyTo) 설정
        GmailApp.sendEmail(recipient, subject, body, {
            name: "Website Lead (KIMS)",
            replyTo: data.email || recipient
        });
    } catch (emailErr) {
        // 실패 시 스크립트 소유자에게 알림
        GmailApp.sendEmail(Session.getActiveUser().getEmail(), "Notification Alert", "발송 실패. 데이터: " + JSON.stringify(data));
    }
}

function triggerAuthorization() {
    GmailApp.sendEmail(Session.getActiveUser().getEmail(), "권한 승인 완료", "이제 전문적인 알림 기능을 사용할 수 있습니다.", {
        name: "Website Lead (KIMS)"
    });
}
