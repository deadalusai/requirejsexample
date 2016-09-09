using Microsoft.AspNetCore.Mvc;

namespace Web.Controllers
{
    public class ErrorController : Controller
    {
        public IActionResult Status(int status)
        {
            return View(new ErrorStatusViewModel(status));
        }

        public IActionResult Default()
        {
            return View();
        }
    }

    public class ErrorStatusViewModel
    {
        public ErrorStatusViewModel(int status)
        {
            Status = status;
        }

        public int Status { get; }

        public string Message => GetMessageForStatus(Status);

        private string GetMessageForStatus(int status)
        {
            switch (status)
            {
                case 404:
                    return "Not found";

                default:
                    return "Something went wrong";
            }
        }
    }
}
